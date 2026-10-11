const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
const { store } = require("./store");
const { detectChanges } = require("./detector");
const { analyseImpact } = require("./impact");
const { proposeRepair, validateIncident } = require("./repair");

/**
 * Genuine Model Context Protocol Server powered by official @modelcontextprotocol/sdk.
 * Exposes 7 operational tools that directly connect to the API Guardian runtime.
 */
function createMcpServer() {
  const mcpServer = new McpServer({
    name: "api-guardian-mcp",
    version: "1.0.0"
  });

  // Tool 1: list_dependencies
  mcpServer.tool(
    "list_dependencies",
    "List all monitored dependencies, their health status, response latencies, and active contract baselines.",
    {},
    async () => {
      const services = Object.values(store.state.services).map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type || "REST API",
        status: s.status,
        changed: s.changed,
        uptime: s.uptime,
        responseTimeMs: s.responseTimeMs,
        endpoint: s.endpoint,
        dependentWorkflowsCount: (s.dependentWorkflows || []).length
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: services.length, dependencies: services }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 2: inspect_dependency
  mcpServer.tool(
    "inspect_dependency",
    "Inspect a specific dependency including expected baseline contract, observed response, and active compatibility adapter.",
    {
      dependency_id: z.string().describe("ID of the dependency to inspect (e.g. 'weather', 'users', 'products')")
    },
    async ({ dependency_id }) => {
      const service = store.state.services[dependency_id];
      if (!service) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: Dependency '${dependency_id}' not found in registry.` }]
        };
      }
      const baseline = store.state.baselines[dependency_id] || null;
      const adapter = store.state.adapters[dependency_id] || null;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                dependency: service,
                baseline,
                adapter,
                hasActiveAdapter: Boolean(adapter?.enabled)
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  // Tool 3: run_dependency_monitor
  mcpServer.tool(
    "run_dependency_monitor",
    "Trigger automated contract monitoring across all dependencies, detecting contract drift and creating incidents.",
    {},
    async () => {
      const summary = [];
      const newIncidents = [];

      for (const service of Object.values(store.state.services)) {
        service.lastObservedAt = new Date().toISOString();
        const baseline = store.state.baselines[service.id];
        const changes = detectChanges(baseline, service.current);

        summary.push({
          serviceId: service.id,
          serviceName: service.name,
          changed: changes.length > 0,
          changesCount: changes.length
        });

        if (changes.length > 0) {
          const isBreaking = changes.some((c) => c.severity === "BREAKING");
          const impact = analyseImpact(service.id, changes, store.state.dependencies);
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
            updatedAt: new Date().toISOString()
          };
          store.state.incidents.unshift(incident);
          newIncidents.push(incident);
          service.status = "DEGRADED";
          service.changed = true;
        }
      }

      store.save();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: "Monitoring execution completed",
                monitoredCount: summary.length,
                incidentsCreated: newIncidents.length,
                summary
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  // Tool 4: simulate_dependency_change
  mcpServer.tool(
    "simulate_dependency_change",
    "Simulate an upstream breaking contract change or performance drift on a designated dependency.",
    {
      dependency_id: z.string().describe("ID of the dependency to perturb (e.g. 'weather', 'users')"),
      custom_payload: z
        .record(z.any())
        .optional()
        .describe("Optional custom JSON payload to set as observed response")
    },
    async ({ dependency_id, custom_payload }) => {
      const result = store.simulateChange(dependency_id, custom_payload);
      if (!result.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${result.error}` }]
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                message: `Simulation applied to dependency '${dependency_id}'`,
                currentObserved: result.data.current
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  // Tool 5: get_incident_impact
  mcpServer.tool(
    "get_incident_impact",
    "Calculate downstream blast radius and affected application workflows for a detected incident.",
    {
      incident_id: z.string().describe("Incident ID (e.g. 'INC-001')")
    },
    async ({ incident_id }) => {
      const incident = store.findIncident(incident_id);
      if (!incident) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: Incident '${incident_id}' not found.` }]
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                incidentId: incident.id,
                serviceId: incident.serviceId,
                severity: incident.severity,
                impact: incident.impact
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  // Tool 6: propose_compatibility_fix
  mcpServer.tool(
    "propose_compatibility_fix",
    "Generate a deterministic compatibility repair proposal (adapter mapping and code diff) for an incident.",
    {
      incident_id: z.string().describe("Incident ID requiring repair proposal")
    },
    async ({ incident_id }) => {
      const incident = store.findIncident(incident_id);
      if (!incident) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: Incident '${incident_id}' not found.` }]
        };
      }
      const result = proposeRepair(incident, store.state);
      if (!result.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error generating repair: ${result.error}` }]
        };
      }
      incident.repairProposal = result.proposal;
      incident.status = "REPAIR_PROPOSED";
      store.save();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ incidentId: incident.id, proposal: result.proposal }, null, 2)
          }
        ]
      };
    }
  );

  // Tool 7: validate_compatibility_fix
  mcpServer.tool(
    "validate_compatibility_fix",
    "Execute 5-suite regression validation tests against the normalized response to verify repair integrity.",
    {
      incident_id: z.string().describe("Incident ID to run regression validation on")
    },
    async ({ incident_id }) => {
      const incident = store.findIncident(incident_id);
      if (!incident) {
        return {
          isError: true,
          content: [{ type: "text", text: `Error: Incident '${incident_id}' not found.` }]
        };
      }
      const result = validateIncident(incident, store.state);
      incident.validation = result;
      incident.status = result.passed ? "VALIDATED" : "VALIDATION_FAILED";
      store.save();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                incidentId: incident.id,
                passed: result.passed,
                summary: result.summary,
                checks: result.checks
              },
              null,
              2
            )
          }
        ]
      };
    }
  );

  return mcpServer;
}

/**
 * Sets up Streamable HTTP transport and mounts MCP routes on Express app.
 */
function setupMcpRoutes(app) {
  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => `mcp-session-${Date.now()}`
  });

  mcpServer.connect(transport).catch((err) => {
    console.error("Failed to connect MCP server to StreamableHTTPServerTransport:", err);
  });

  // Official Streamable HTTP MCP Endpoint
  app.all("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("MCP transport error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "MCP Transport error", message: err.message });
      }
    }
  });

  // Informational JSON Endpoints for Frontend / Browser Inspection
  app.get("/api/mcp/info", (_req, res) => {
    res.json({
      name: "API Guardian MCP Server",
      version: "1.0.0",
      protocol: "Model Context Protocol (MCP)",
      sdk: "@modelcontextprotocol/sdk@1.32.1",
      transport: "Streamable HTTP (SSE compatible)",
      endpoint: "/mcp",
      toolsCount: 7,
      status: "ACTIVE"
    });
  });

  app.get("/api/mcp/tools", (_req, res) => {
    res.json({
      tools: [
        {
          name: "list_dependencies",
          description: "List all monitored dependencies, health status, and active contracts",
          inputSchema: {}
        },
        {
          name: "inspect_dependency",
          description: "Inspect specific dependency, baseline contract, and active adapter",
          inputSchema: { dependency_id: "string (required)" }
        },
        {
          name: "run_dependency_monitor",
          description: "Trigger automated contract monitoring and incident creation",
          inputSchema: {}
        },
        {
          name: "simulate_dependency_change",
          description: "Simulate an upstream contract break or latency drift",
          inputSchema: { dependency_id: "string (required)", custom_payload: "object (optional)" }
        },
        {
          name: "get_incident_impact",
          description: "Calculate downstream blast radius and affected workflows",
          inputSchema: { incident_id: "string (required)" }
        },
        {
          name: "propose_compatibility_fix",
          description: "Generate safe compatibility repair proposal and adapter code",
          inputSchema: { incident_id: "string (required)" }
        },
        {
          name: "validate_compatibility_fix",
          description: "Run 5-suite regression test validation on repaired dependency",
          inputSchema: { incident_id: "string (required)" }
        }
      ]
    });
  });

  return { mcpServer, transport };
}

module.exports = {
  createMcpServer,
  setupMcpRoutes
};
