const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/server");
const { store } = require("../src/store");
const { detectChanges } = require("../src/detector");
const { proposeRepair } = require("../src/repair");

let server;
let baseUrl;

test.before(async () => {
  store.reset();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("detects HTTP 429 rate limit contract break", () => {
  const baseline = { statusCode: 200, body: { status: "ok" } };
  const observed = {
    statusCode: 429,
    headers: { "retry-after": "90" },
    body: { error: "Rate limit exceeded" }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "RATE_LIMITED" && c.actual === 429));
});

test("detects pagination structure change (page number to cursor)", () => {
  const baseline = {
    statusCode: 200,
    body: { page: 1, limit: 20, items: [] }
  };
  const observed = {
    statusCode: 200,
    body: { cursor: "tok_cursor_9918", limit: 20, items: [] }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "PAGINATION_CHANGED"));
});

test("detects error format change (string to array)", () => {
  const baseline = {
    statusCode: 400,
    body: { error: "Invalid payment token" }
  };
  const observed = {
    statusCode: 400,
    body: { errors: [{ code: "INVALID_TOKEN", message: "Invalid payment token" }] }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "ERROR_FORMAT_CHANGED"));
});

test("detects semantic drift on valid JSON and generates uncertain repair proposal", () => {
  const baseline = {
    statusCode: 200,
    body: { orderId: "ORD-1", status: "PAID", amount: 1500 }
  };
  const observed = {
    statusCode: 200,
    body: { orderId: "ORD-1", status: "PROCESSING", amount: 1500 }
  };
  const changes = detectChanges(baseline, observed);
  assert.ok(changes.some((c) => c.kind === "SEMANTIC_DRIFT" && c.severity === "UNCERTAIN"));

  const incident = { serviceId: "payments", changes };
  const proposal = proposeRepair(incident, store.state);
  assert.equal(proposal.ok, true);
  assert.equal(proposal.proposal.type, "SEMANTIC_TRANSITION");
  assert.equal(proposal.proposal.requiresHumanApproval, true);
  assert.ok(proposal.proposal.confidence < 0.85); // Explicit uncertain confidence rating
});

test("GET /api/dependencies and /api/dependencies/graph return multi-dependency sandbox inventory", async () => {
  const res = await fetch(`${baseUrl}/api/dependencies`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.total >= 8);
  assert.ok(Array.isArray(data.dependencies));

  const types = data.dependencies.map((d) => d.type);
  assert.ok(types.includes("REST API"));
  assert.ok(types.includes("SDK Adapter"));
  assert.ok(types.includes("Rate-Limited Service"));
  assert.ok(types.includes("Semantic Status Service"));
  assert.ok(types.includes("MCP Server"));
  assert.ok(types.includes("Webhook Event Source"));

  const graphRes = await fetch(`${baseUrl}/api/dependencies/graph`);
  assert.equal(graphRes.status, 200);
  const graphData = await graphRes.json();
  assert.ok(Array.isArray(graphData.nodes));
  assert.ok(Array.isArray(graphData.edges));
  assert.ok(graphData.nodes.length >= 8);
  assert.ok(graphData.edges.length > 0);
});
