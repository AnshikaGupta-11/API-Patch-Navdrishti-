const express = require("express");
const cors = require("cors");
const { store } = require("./store");
const { detectChanges } = require("./detector");
const { analyseImpact } = require("./impact");
const {
  proposeRepair,
  applyRepair,
  rollbackRepair,
  normalisedResponse,
  validateIncident
} = require("./repair");
const {
  handleWebhookReceiver,
  handleWebhookSimulator,
  getWebhookHistory
} = require("./webhooks");
const { setupMcpRoutes } = require("./mcp-server");
const {
  getSdkScenarioStatus,
  simulateSdkUpgrade,
  applySdkAdapter,
  runSdkWorkflow,
  resetSdkScenario
} = require("./sdk-compat");
const {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler
} = require("./auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// ----------------------------------------------------------------------
// 0. Authentication Endpoints (Persistent SQLite & Scrypt Security)
// ----------------------------------------------------------------------

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/signup", registerHandler);
app.post("/api/auth/login", loginHandler);
app.get("/api/auth/me", meHandler);
app.post("/api/auth/logout", logoutHandler);


// ----------------------------------------------------------------------
// 1. Health & Dashboard Overview Endpoints
// ----------------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "API Guardian Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/dashboard", (_req, res) => {
  const serviceList = Object.values(store.state.services);
  const totalApis = serviceList.length;
  const unresolvedIncidents = store.state.incidents.filter(
    (i) => !["VALIDATED", "RESOLVED", "CLOSED"].includes(i.status)
  );
  const unresolvedServiceIds = new Set(unresolvedIncidents.map((i) => i.serviceId));
  const apisWithChanges = serviceList.filter(
    (s) => (s.changed || unresolvedServiceIds.has(s.id)) && s.status !== "HEALTHY"
  ).length;
  const healthyApis = Math.max(0, totalApis - apisWithChanges);

  const totalResponseTime = serviceList.reduce(
    (sum, s) => sum + (s.responseTimeMs || 200),
    0
  );
  const avgResponseTimeMs = Math.round(totalResponseTime / Math.max(1, totalApis));

  const monitoredApis = serviceList.map((service) => ({
    id: service.id,
    name: service.name,
    endpoint: service.endpoint || `/api/${service.id}`,
    status: (service.changed || unresolvedServiceIds.has(service.id)) && service.status !== "HEALTHY" ? "Changed" : "HEALTHY",
    changed: (service.changed || unresolvedServiceIds.has(service.id)) && service.status !== "HEALTHY",
    uptime: service.uptime || "99.8%",
    responseTimeMs: service.responseTimeMs || 220,
    lastCheckedAt: service.lastObservedAt || new Date().toISOString()
  }));

  res.json({
    stats: {
      totalApis,
      apisWithChanges,
      healthyApis,
      avgResponseTimeMs
    },
    monitoredApis,
    recentActivity: store.state.recentActivity || [],
    openIncidentsCount: apisWithChanges
  });
});

// ----------------------------------------------------------------------
// 2. Monitored Services Endpoints
// ----------------------------------------------------------------------

app.get("/api/services", (_req, res) => {
  const unresolvedIncidents = store.state.incidents.filter(
    (i) => !["VALIDATED", "RESOLVED", "CLOSED"].includes(i.status)
  );
  const unresolvedServiceIds = new Set(unresolvedIncidents.map((i) => i.serviceId));
  res.json({
    services: Object.values(store.state.services).map((service) => {
      const isChanged = (service.changed || unresolvedServiceIds.has(service.id)) && service.status !== "HEALTHY";
      return {
        id: service.id,
        name: service.name,
        endpoint: service.endpoint || `/api/${service.id}`,
        status: isChanged ? "DEGRADED" : "HEALTHY",
        changed: isChanged,
        uptime: service.uptime || "99.8%",
        responseTimeMs: service.responseTimeMs || 220,
        lastObservedAt: service.lastObservedAt
      };
    })
  });
});

app.get("/api/services/:serviceId", (req, res) => {
  const service = store.state.services[req.params.serviceId];
  if (!service) return sendError(res, 404, "Unknown service");
  const baseline = store.state.baselines[service.id];
  const adapter = store.state.adapters[service.id];

  res.json({
    service,
    baseline,
    adapter: adapter || null
  });
});

app.get("/api/services/:serviceId/baseline", (req, res) => {
  const baseline = store.state.baselines[req.params.serviceId];
  if (!baseline) return sendError(res, 404, "Unknown service");
  res.json({ serviceId: req.params.serviceId, baseline });
});

app.get("/api/services/:serviceId/current", (req, res) => {
  const service = store.state.services[req.params.serviceId];
  if (!service) return sendError(res, 404, "Unknown service");

  const normalized = normalisedResponse(service, store.state);

  res.json({
    serviceId: service.id,
    statusCode: service.current.statusCode,
    headers: service.current.headers || {},
    body: service.current.body,
    changed: service.changed,
    normalizedBody: normalized.body,
    hasAdapter: Boolean(store.state.adapters[service.id]?.enabled)
  });
});

app.post("/api/services/:serviceId/simulate-change", (req, res) => {
  const result = store.simulateChange(req.params.serviceId, req.body?.customPayload);
  if (!result.ok) return sendError(res, 404, result.error);
  res.json({ message: "Demo API change simulated successfully", ...result.data });
});

// ----------------------------------------------------------------------
// 3. Monitor & Change Detection Endpoints
// ----------------------------------------------------------------------

app.post("/api/monitor/run", (_req, res) => {
  const created = [];
  const summary = [];

  for (const service of Object.values(store.state.services)) {
    service.lastObservedAt = new Date().toISOString();
    const baseline = store.state.baselines[service.id];
    const observed = normalisedResponse(service, store.state);
    const changes = detectChanges(baseline, observed);

    summary.push({
      serviceId: service.id,
      serviceName: service.name,
      changed: changes.length > 0,
      changes
    });

    if (changes.length > 0) {
      const existingOpen = store.state.incidents.find(
        (incident) =>
          incident.serviceId === service.id &&
          incident.status !== "VALIDATED" &&
          incident.status !== "RESOLVED" &&
          incident.status !== "CLOSED"
      );

      const impact = analyseImpact(service.id, changes, store.state.dependencies);
      const isBreaking = changes.some((c) => c.severity === "BREAKING");

      if (existingOpen) {
        existingOpen.changes = changes;
        existingOpen.impact = impact;
        existingOpen.severity = isBreaking ? "HIGH" : "MEDIUM";
        existingOpen.updatedAt = new Date().toISOString();
        created.push(existingOpen);
      } else {
        const incidentNumber = String(store.state.nextIncidentNumber++).padStart(3, "0");
        const incident = {
          id: `INC-${incidentNumber}`,
          serviceId: service.id,
          serviceName: service.name,
          status: "DETECTED",
          severity: isBreaking ? "HIGH" : "MEDIUM",
          changes,
          impact,
          repairProposal: null,
          validation: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              status: "DETECTED",
              timestamp: new Date().toISOString(),
              message: `Detected ${changes.length} contract difference(s) on ${service.name}`
            }
          ]
        };
        store.state.incidents.unshift(incident);
        created.push(incident);

        store.logActivity({
          serviceId: service.id,
          serviceName: service.name,
          type: "CHANGED",
          badge: isBreaking ? "breaking" : "changed",
          message: `${service.name} contract change detected (${changes.length} change(s))`
        });
      }
      service.status = "DEGRADED";
      service.changed = true;
    } else {
      if (service.status !== "HEALTHY") {
        service.status = "HEALTHY";
        service.changed = false;
      }
    }
  }

  store.save();
  res.json({
    message: "Monitoring run completed",
    summary,
    incidents: created,
    totalOpenIncidents: store.state.incidents.filter(
      (incident) => !["VALIDATED", "RESOLVED", "CLOSED"].includes(incident.status)
    ).length
  });
});

app.get("/api/changes", (_req, res) => {
  const changesOverview = [];
  const unresolvedIncidents = store.state.incidents.filter(
    (i) => !["VALIDATED", "RESOLVED", "CLOSED"].includes(i.status)
  );
  const unresolvedMap = new Map();
  for (const inc of unresolvedIncidents) {
    if (!unresolvedMap.has(inc.serviceId)) {
      unresolvedMap.set(inc.serviceId, inc);
    }
  }

  for (const service of Object.values(store.state.services)) {
    const incident = unresolvedMap.get(service.id);
    const baseline = store.state.baselines[service.id];
    const isChanged = (service.changed || Boolean(incident)) && service.status !== "HEALTHY";

    if (isChanged && baseline) {
      const changes = incident?.changes || detectChanges(baseline, service.current);
      if (changes.length > 0) {
        changesOverview.push({
          serviceId: service.id,
          serviceName: service.name,
          endpoint: service.endpoint,
          previousResponse: baseline.body || baseline,
          currentResponse: service.current?.body || service.current,
          changesDetected: changes,
          incidentId: incident?.id || null,
          severity: incident?.severity || (changes.some((c) => c.severity === "BREAKING") ? "HIGH" : "MEDIUM"),
          createdAt: incident?.createdAt || service.lastObservedAt || new Date().toISOString(),
          status: changes.some((c) => c.severity === "BREAKING")
            ? "Breaking Change Detected"
            : "Minor Change Detected"
        });
      }
    }
  }

  res.json({
    changes: changesOverview,
    totalServicesWithChanges: changesOverview.length,
    unresolvedCount: changesOverview.length
  });
});

// ----------------------------------------------------------------------
// 4. Incident Management & History Endpoints
// ----------------------------------------------------------------------

app.get("/api/incidents", (req, res) => {
  let incidents = store.state.incidents;

  if (req.query.status) {
    incidents = incidents.filter((i) => i.status === req.query.status);
  }
  if (req.query.serviceId) {
    incidents = incidents.filter((i) => i.serviceId === req.query.serviceId);
  }
  if (req.query.severity) {
    incidents = incidents.filter((i) => i.severity === req.query.severity);
  }

  res.json({ incidents, count: incidents.length });
});

app.get("/api/incidents/:id", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");
  res.json({ incident });
});

app.get("/api/incidents/:id/impact", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");
  res.json({
    incidentId: incident.id,
    serviceId: incident.serviceId,
    impact: incident.impact
  });
});

// ----------------------------------------------------------------------
// 5. Safe Repair Proposals & Approval Endpoints
// ----------------------------------------------------------------------

app.post("/api/incidents/:id/propose-fix", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");

  const result = proposeRepair(incident, store.state);
  if (!result.ok) return sendError(res, 422, result.error);

  incident.repairProposal = result.proposal;
  incident.status = "REPAIR_PROPOSED";
  incident.updatedAt = new Date().toISOString();
  if (!incident.history) incident.history = [];
  incident.history.push({
    status: "REPAIR_PROPOSED",
    timestamp: new Date().toISOString(),
    message: `Repair proposal generated (${result.proposal.type}). Awaiting explicit human approval.`
  });

  store.save();
  res.json({ incident, proposal: result.proposal });
});

app.post("/api/incidents/:id/apply-fix", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");

  // STRICT REQUIREMENT: Explicit Human Approval
  if (req.body?.approved !== true) {
    return sendError(
      res,
      400,
      'Explicit approval required: send { "approved": true }'
    );
  }

  if (!incident.repairProposal) {
    return sendError(res, 400, "Create a repair proposal first before applying fix");
  }

  incident.repairProposal.approved = true;
  incident.repairProposal.approvedAt = new Date().toISOString();
  incident.repairProposal.approvedBy = req.body?.approvedBy || "Admin / Human Reviewer";

  const result = applyRepair(incident, store.state);
  if (!result.ok) return sendError(res, 422, result.error);

  incident.status = "REPAIR_APPLIED";
  incident.updatedAt = new Date().toISOString();
  if (!incident.history) incident.history = [];
  incident.history.push({
    status: "REPAIR_APPLIED",
    timestamp: new Date().toISOString(),
    message: `Approved compatibility adapter applied by ${incident.repairProposal.approvedBy}`
  });

  store.logActivity({
    serviceId: incident.serviceId,
    serviceName: incident.serviceName,
    type: "RESOLVED",
    badge: "repaired",
    message: `Compatibility adapter applied for ${incident.serviceName}`
  });

  store.save();
  res.json({
    message: "Approved compatibility adapter applied successfully",
    incident
  });
});

app.post("/api/incidents/:id/reject-fix", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");

  incident.status = "MANUAL_REVIEW_REQUIRED";
  if (incident.repairProposal) {
    incident.repairProposal.approved = false;
    incident.repairProposal.rejectedAt = new Date().toISOString();
    incident.repairProposal.rejectionReason = req.body?.reason || "Rejected by user for manual review";
  }
  incident.updatedAt = new Date().toISOString();
  if (!incident.history) incident.history = [];
  incident.history.push({
    status: "MANUAL_REVIEW_REQUIRED",
    timestamp: new Date().toISOString(),
    message: req.body?.reason || "Repair rejected for manual engineering review"
  });

  store.save();
  res.json({ message: "Proposal flagged for manual review", incident });
});

app.post("/api/incidents/:id/rollback", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");

  const result = rollbackRepair(incident, store.state);
  const service = store.state.services[incident.serviceId];
  if (service) {
    service.status = "DEGRADED";
    service.changed = true;
  }
  if (!incident.history) incident.history = [];
  incident.history.push({
    status: "ROLLED_BACK",
    timestamp: new Date().toISOString(),
    message: "Adapter rolled back to previous state"
  });

  store.logActivity({
    serviceId: incident.serviceId,
    serviceName: incident.serviceName,
    type: "CHANGED",
    badge: "rollback",
    message: `Adapter rolled back for ${incident.serviceName}`
  });

  store.save();
  res.json({ message: result.message, incident });
});

// ----------------------------------------------------------------------
// 6. Regression Testing & Validation Endpoints
// ----------------------------------------------------------------------

app.post("/api/incidents/:id/validate", (req, res) => {
  const incident = store.findIncident(req.params.id);
  if (!incident) return sendError(res, 404, "Incident not found");

  const result = validateIncident(incident, store.state);
  incident.validation = result;
  incident.status = result.passed ? "VALIDATED" : "VALIDATION_FAILED";
  incident.updatedAt = new Date().toISOString();

  if (!incident.history) incident.history = [];
  incident.history.push({
    status: incident.status,
    timestamp: new Date().toISOString(),
    message: result.passed
      ? "All 5 regression validation test suites passed. Incident resolved."
      : "Regression tests failed."
  });

  const service = store.state.services[incident.serviceId];
  if (service) {
    if (result.passed) {
      incident.resolved = true;
      incident.resolvedAt = new Date().toISOString();
      service.status = "HEALTHY";
      service.changed = false;

      // Synchronize all open/stale records for this service into resolved state
      for (const other of store.state.incidents) {
        if (other.serviceId === incident.serviceId && !["VALIDATED", "RESOLVED", "CLOSED"].includes(other.status)) {
          other.status = "VALIDATED";
          other.resolved = true;
          other.updatedAt = new Date().toISOString();
        }
      }

      store.logActivity({
        serviceId: service.id,
        serviceName: service.name,
        type: "RESOLVED",
        badge: "resolved",
        message: `${service.name} - issue resolved and validated`
      });
    } else {
      incident.resolved = false;
      service.status = "DEGRADED";
      service.changed = true;
    }
  }

  store.save();
  res.status(result.passed ? 200 : 422).json({ incident, validation: result });
});

// ----------------------------------------------------------------------
// 7. Proxy Endpoint (Simulates Live Gateway/Client Consumption)
// ----------------------------------------------------------------------

app.get("/api/proxy/:serviceId", (req, res) => {
  const service = store.state.services[req.params.serviceId];
  if (!service) return sendError(res, 404, "Unknown service");

  const normalized = normalisedResponse(service, store.state);
  res.status(normalized.statusCode || 200).json(normalized.body);
});

// ----------------------------------------------------------------------
// 8. Multi-Dependency Registry & Architecture Graph Endpoints
// ----------------------------------------------------------------------

app.get("/api/dependencies", (_req, res) => {
  const dependencies = Object.values(store.state.services).map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type || "REST API",
    description: s.description || "",
    endpoint: s.endpoint || `/api/${s.id}`,
    status: s.status,
    changed: s.changed,
    uptime: s.uptime || "99.8%",
    responseTimeMs: s.responseTimeMs || 200,
    dependentWorkflows: s.dependentWorkflows || [],
    remediationStatus: store.state.adapters[s.id]?.enabled
      ? "ADAPTER_ACTIVE"
      : s.changed
      ? "REMEDIATION_NEEDED"
      : "HEALTHY",
    lastObservedAt: s.lastObservedAt,
    hasActiveAdapter: Boolean(store.state.adapters[s.id]?.enabled)
  }));

  res.json({
    total: dependencies.length,
    dependencies,
    types: [
      "REST API",
      "SDK Adapter",
      "Rate-Limited Service",
      "Semantic Status Service",
      "MCP Server",
      "Webhook Event Source"
    ]
  });
});

app.get("/api/dependencies/graph", (_req, res) => {
  const nodes = [];
  const edges = [];

  for (const service of Object.values(store.state.services)) {
    nodes.push({
      id: service.id,
      label: service.name,
      type: service.type || "REST API",
      status: service.status,
      category: "dependency"
    });

    const workflows = service.dependentWorkflows || [];
    for (const wf of workflows) {
      const wfId = `wf-${wf.toLowerCase().replace(/\s+/g, "-")}`;
      if (!nodes.some((n) => n.id === wfId)) {
        nodes.push({
          id: wfId,
          label: wf,
          type: "workflow",
          category: "downstream"
        });
      }
      edges.push({
        from: service.id,
        to: wfId,
        impact: service.changed ? "BROKEN" : "HEALTHY"
      });
    }
  }

  res.json({ nodes, edges, dependenciesCount: Object.keys(store.state.services).length });
});

// ----------------------------------------------------------------------
// 9. Real Webhook Receiver, Simulator & History Endpoints
// ----------------------------------------------------------------------

app.post("/api/webhooks/receiver", handleWebhookReceiver);
app.post("/api/webhooks/simulate", handleWebhookSimulator);
app.get("/api/webhooks/history", getWebhookHistory);

// ----------------------------------------------------------------------
// 10. SDK Version Compatibility Scenario Endpoints
// ----------------------------------------------------------------------

app.get("/api/sdk-scenario/status", (_req, res) => {
  res.json(getSdkScenarioStatus());
});

app.post("/api/sdk-scenario/simulate-upgrade", async (_req, res) => {
  const result = await simulateSdkUpgrade();
  res.json({ message: "SDK upgraded from v1 to v2 (breaking change introduced)", ...result });
});

app.post("/api/sdk-scenario/apply-adapter", async (req, res) => {
  try {
    const approved = req.body?.approved === true;
    const result = await applySdkAdapter(approved);
    res.json({ message: "SDK compatibility adapter applied and validated", ...result });
  } catch (err) {
    sendError(res, 400, err.message);
  }
});

app.post("/api/sdk-scenario/run-workflow", async (_req, res) => {
  const result = await runSdkWorkflow();
  res.json({ workflowResult: result });
});

app.post("/api/sdk-scenario/reset", (_req, res) => {
  const result = resetSdkScenario();
  res.json({ message: "SDK scenario reset to v1 baseline", status: result });
});

// ----------------------------------------------------------------------
// 11. Official Model Context Protocol (MCP) Server Setup
// ----------------------------------------------------------------------

setupMcpRoutes(app);

// ----------------------------------------------------------------------
// 12. Demo Reset Endpoint
// ----------------------------------------------------------------------

const handleReset = (_req, res) => {
  store.reset();
  resetSdkScenario();
  res.json({
    ok: true,
    message: "Demo state reset to clean baseline",
    services: Object.keys(store.state.services),
    timestamp: new Date().toISOString()
  });
};

app.post("/api/demo/reset", handleReset);
app.post("/api/reset", handleReset);

// ----------------------------------------------------------------------
// 9. Error Handler
// ----------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Guardian backend listening on http://localhost:${PORT}`);
  });
}

module.exports = { app };
