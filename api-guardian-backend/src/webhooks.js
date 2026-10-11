const crypto = require("node:crypto");
const { store } = require("./store");
const { detectChanges } = require("./detector");
const { analyseImpact } = require("./impact");

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "api-guardian-secret-token";
const VALID_EVENT_TYPES = [
  "dependency.changed",
  "dependency.degraded",
  "dependency.rate_limited",
  "dependency.recovered"
];

function computeHmacSignature(payloadString, secret = WEBHOOK_SECRET) {
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

function verifyHmacSignature(rawBody, signatureHeader, secret = WEBHOOK_SECRET) {
  if (!signatureHeader) return false;
  const expected = computeHmacSignature(rawBody, secret);
  try {
    const sigBuf = Buffer.from(signatureHeader, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Real Webhook Receiver POST handler.
 * Validates payload schema, verifies HMAC (if provided/required),
 * enforces idempotency, updates dependency state, and triggers incident pipeline.
 */
async function handleWebhookReceiver(req, res) {
  const { eventId, eventType, dependencyId, serviceId, timestamp, payload, simulated } = req.body || {};
  const targetId = dependencyId || serviceId;

  // 1. Schema Validation
  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'eventId' field" });
  }

  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
    return res.status(400).json({
      error: `Invalid 'eventType'. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`
    });
  }

  if (!targetId || typeof targetId !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'dependencyId' (or 'serviceId')" });
  }

  const service = store.state.services[targetId];
  if (!service) {
    return res.status(404).json({ error: `Target dependency '${targetId}' not found in registry` });
  }

  // 2. Optional HMAC Verification
  const signatureHeader = req.headers["x-guardian-signature"];
  if (signatureHeader) {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const valid = verifyHmacSignature(rawBody, signatureHeader);
    if (!valid) {
      return res.status(401).json({ error: "Invalid HMAC signature header 'x-guardian-signature'" });
    }
  }

  // 3. Idempotency Check
  if (!store.state.processedWebhookIds) {
    store.state.processedWebhookIds = [];
  }

  if (store.state.processedWebhookIds.includes(eventId)) {
    return res.status(200).json({
      status: "duplicate",
      duplicate: true,
      message: `Event ID '${eventId}' has already been processed (idempotency check passed).`,
      eventId,
      eventType,
      dependencyId: targetId
    });
  }

  // Record event ID for future idempotency checks
  store.state.processedWebhookIds.push(eventId);
  if (store.state.processedWebhookIds.length > 500) {
    store.state.processedWebhookIds.shift();
  }

  // 4. Process Event through Detection & Incident Pipeline
  const eventTime = timestamp || new Date().toISOString();
  let processResult = "processed";
  let detectedIncident = null;

  switch (eventType) {
    case "dependency.changed": {
      store.simulateChange(targetId, payload);
      const baseline = store.state.baselines[targetId];
      const changes = detectChanges(baseline, service.current);

      if (changes.length > 0) {
        const impact = analyseImpact(targetId, changes, store.state.dependencies);
        const isBreaking = changes.some((c) => c.severity === "BREAKING");
        const incidentNumber = String(store.state.nextIncidentNumber++).padStart(3, "0");

        detectedIncident = {
          id: `INC-${incidentNumber}`,
          serviceId: targetId,
          serviceName: service.name,
          status: "DETECTED",
          severity: isBreaking ? "HIGH" : "MEDIUM",
          changes,
          impact,
          source: "webhook",
          repairProposal: null,
          validation: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            {
              status: "DETECTED",
              timestamp: new Date().toISOString(),
              message: `Webhook event '${eventType}' (${eventId}) triggered detection: ${changes.length} difference(s)`
            }
          ]
        };
        store.state.incidents.unshift(detectedIncident);
        processResult = `Incident created: ${detectedIncident.id} (${changes.length} change(s))`;
      }
      break;
    }

    case "dependency.degraded": {
      service.responseTimeMs = payload?.responseTimeMs || 580;
      service.status = "DEGRADED";
      service.lastObservedAt = new Date().toISOString();
      store.logActivity({
        serviceId: targetId,
        serviceName: service.name,
        type: "PERFORMANCE",
        badge: "performance",
        message: `Webhook notified degradation for ${service.name} (latency: ${service.responseTimeMs}ms)`
      });
      processResult = `Degradation noted. Latency set to ${service.responseTimeMs}ms`;
      break;
    }

    case "dependency.rate_limited": {
      service.current.statusCode = 429;
      service.current.headers = {
        ...service.current.headers,
        "retry-after": String(payload?.retryAfter || "60"),
        "x-ratelimit-remaining": "0"
      };
      service.status = "RATE_LIMITED";
      service.changed = true;
      service.lastObservedAt = new Date().toISOString();

      store.logActivity({
        serviceId: targetId,
        serviceName: service.name,
        type: "CHANGED",
        badge: "breaking",
        message: `Webhook notified HTTP 429 Rate Limit on ${service.name}`
      });

      const baseline = store.state.baselines[targetId];
      const changes = detectChanges(baseline, service.current);
      const impact = analyseImpact(targetId, changes, store.state.dependencies);
      const incidentNumber = String(store.state.nextIncidentNumber++).padStart(3, "0");

      detectedIncident = {
        id: `INC-${incidentNumber}`,
        serviceId: targetId,
        serviceName: service.name,
        status: "DETECTED",
        severity: "HIGH",
        changes,
        impact,
        source: "webhook_rate_limit",
        repairProposal: null,
        validation: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.state.incidents.unshift(detectedIncident);
      processResult = `Rate limit incident created: ${detectedIncident.id}`;
      break;
    }

    case "dependency.recovered": {
      const baseline = store.state.baselines[targetId];
      if (baseline) {
        service.current = JSON.parse(JSON.stringify(baseline));
      }
      service.status = "HEALTHY";
      service.changed = false;
      service.lastObservedAt = new Date().toISOString();
      store.logActivity({
        serviceId: targetId,
        serviceName: service.name,
        type: "RESOLVED",
        badge: "resolved",
        message: `Webhook confirmed recovery of ${service.name} back to healthy baseline`
      });
      processResult = `${service.name} marked HEALTHY`;
      break;
    }
  }

  // 5. Record Event in Webhook History
  const historyEntry = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventId,
    eventType,
    dependencyId: targetId,
    dependencyName: service.name,
    timestamp: eventTime,
    receivedAt: new Date().toISOString(),
    result: processResult,
    incidentId: detectedIncident ? detectedIncident.id : null,
    simulated: Boolean(simulated),
    hasSignature: Boolean(signatureHeader)
  };

  if (!store.state.webhookEvents) {
    store.state.webhookEvents = [];
  }
  store.state.webhookEvents.unshift(historyEntry);
  if (store.state.webhookEvents.length > 50) {
    store.state.webhookEvents = store.state.webhookEvents.slice(0, 50);
  }

  store.save();

  return res.status(200).json({
    success: true,
    eventId,
    eventType,
    dependencyId: targetId,
    status: "PROCESSED",
    result: processResult,
    incident: detectedIncident
  });
}

/**
 * Webhook Simulator POST handler.
 * Generates an event and makes an actual HTTP POST request to the local webhook receiver endpoint.
 */
async function handleWebhookSimulator(req, res) {
  const { eventType, dependencyId, payload, signWithHmac = true } = req.body || {};
  const targetId = dependencyId || "weather";
  const event = eventType || "dependency.changed";

  const generatedEventId = `evt-sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const bodyPayload = {
    eventId: generatedEventId,
    eventType: event,
    dependencyId: targetId,
    timestamp: new Date().toISOString(),
    payload: payload || null,
    simulated: true
  };

  const rawBody = JSON.stringify(bodyPayload);
  const headers = {
    "Content-Type": "application/json"
  };

  if (signWithHmac) {
    headers["x-guardian-signature"] = computeHmacSignature(rawBody, WEBHOOK_SECRET);
  }

  const port = process.env.PORT || 3001;
  const targetUrl = `http://127.0.0.1:${port}/api/webhooks/receiver`;

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: rawBody
    });

    const responseData = await fetchResponse.json();
    return res.status(fetchResponse.status).json({
      simulated: true,
      targetUrl,
      eventSent: bodyPayload,
      receiverResponse: responseData
    });
  } catch (err) {
    return res.status(500).json({
      error: "Webhook simulator failed to reach receiver over HTTP",
      detail: err.message
    });
  }
}

function getWebhookHistory(_req, res) {
  const events = store.state.webhookEvents || [];
  res.json({
    events,
    total: events.length,
    secretConfigured: Boolean(WEBHOOK_SECRET)
  });
}

module.exports = {
  handleWebhookReceiver,
  handleWebhookSimulator,
  getWebhookHistory,
  computeHmacSignature,
  verifyHmacSignature,
  VALID_EVENT_TYPES,
  WEBHOOK_SECRET
};
