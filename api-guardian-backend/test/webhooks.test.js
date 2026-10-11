const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/server");
const { store } = require("../src/store");
const { computeHmacSignature, WEBHOOK_SECRET } = require("../src/webhooks");

let server;
let baseUrl;

test.before(async () => {
  store.reset();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      process.env.PORT = String(port);
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("POST /api/webhooks/receiver rejects missing eventId and invalid eventType", async () => {
  const res1 = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType: "dependency.changed", dependencyId: "weather" })
  });
  assert.equal(res1.status, 400);

  const res2 = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: "evt-bad", eventType: "unknown.type", dependencyId: "weather" })
  });
  assert.equal(res2.status, 400);
});

test("POST /api/webhooks/receiver validates HMAC signature when provided", async () => {
  const event = {
    eventId: `evt-hmac-${Date.now()}`,
    eventType: "dependency.degraded",
    dependencyId: "weather",
    payload: { responseTimeMs: 500 }
  };
  const rawBody = JSON.stringify(event);

  // Bad signature -> 401
  const badRes = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-guardian-signature": "bad_signature_hash"
    },
    body: rawBody
  });
  assert.equal(badRes.status, 401);

  // Valid signature -> 200
  const validSignature = computeHmacSignature(rawBody, WEBHOOK_SECRET);
  const goodRes = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-guardian-signature": validSignature
    },
    body: rawBody
  });
  assert.equal(goodRes.status, 200);
  const goodData = await goodRes.json();
  assert.equal(goodData.success, true);
});

test("POST /api/webhooks/receiver guarantees idempotency for duplicate events", async () => {
  const eventId = `evt-idemp-${Date.now()}`;
  const event = {
    eventId,
    eventType: "dependency.changed",
    dependencyId: "weather"
  };

  // First dispatch
  const res1 = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.status, "PROCESSED");

  // Duplicate dispatch with exact same eventId
  const res2 = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.duplicate, true);
  assert.equal(data2.status, "duplicate");
});

test("POST /api/webhooks/receiver creates incident on dependency.rate_limited", async () => {
  const event = {
    eventId: `evt-rl-${Date.now()}`,
    eventType: "dependency.rate_limited",
    dependencyId: "github",
    payload: { retryAfter: 120 }
  };

  const res = await fetch(`${baseUrl}/api/webhooks/receiver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.incident);
  assert.equal(data.incident.serviceId, "github");
  assert.equal(data.incident.severity, "HIGH");

  const service = store.state.services.github;
  assert.equal(service.status, "RATE_LIMITED");
  assert.equal(service.current.statusCode, 429);
});

test("GET /api/webhooks/history lists processed events and simulator can dispatch via HTTP", async () => {
  // Test simulator endpoint making actual HTTP call
  const simRes = await fetch(`${baseUrl}/api/webhooks/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "dependency.recovered",
      dependencyId: "github"
    })
  });
  assert.equal(simRes.status, 200);
  const simData = await simRes.json();
  assert.equal(simData.simulated, true);
  assert.equal(simData.receiverResponse.success, true);

  // History endpoint
  const histRes = await fetch(`${baseUrl}/api/webhooks/history`);
  assert.equal(histRes.status, 200);
  const histData = await histRes.json();
  assert.ok(Array.isArray(histData.events));
  assert.ok(histData.events.length > 0);
  const latest = histData.events[0];
  assert.equal(latest.eventType, "dependency.recovered");
  assert.equal(latest.simulated, true);
});
