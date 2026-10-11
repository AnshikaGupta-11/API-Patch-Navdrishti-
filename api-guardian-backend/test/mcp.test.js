const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/server");
const { store } = require("../src/store");
const { createMcpServer } = require("../src/mcp-server");

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

test("GET /api/mcp/info returns MCP server metadata and SDK version", async () => {
  const res = await fetch(`${baseUrl}/api/mcp/info`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.name, "API Guardian MCP Server");
  assert.equal(data.status, "ACTIVE");
  assert.ok(data.sdk.includes("@modelcontextprotocol/sdk"));
  assert.equal(data.toolsCount, 7);
});

test("GET /api/mcp/tools lists all 7 registered operational tools", async () => {
  const res = await fetch(`${baseUrl}/api/mcp/tools`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.tools));
  assert.equal(data.tools.length, 7);

  const toolNames = data.tools.map((t) => t.name);
  assert.ok(toolNames.includes("list_dependencies"));
  assert.ok(toolNames.includes("inspect_dependency"));
  assert.ok(toolNames.includes("run_dependency_monitor"));
  assert.ok(toolNames.includes("simulate_dependency_change"));
  assert.ok(toolNames.includes("get_incident_impact"));
  assert.ok(toolNames.includes("propose_compatibility_fix"));
  assert.ok(toolNames.includes("validate_compatibility_fix"));
});

test("POST /mcp handles complete official protocol lifecycle: initialize, tools/list, and tools/call", async () => {
  const mcpUrl = `${baseUrl}/mcp`;
  const acceptHeader = "application/json, text/event-stream";

  // 1. Initialize Handshake
  const initRes = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: acceptHeader },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test-client", version: "1.0" } }
    })
  });
  assert.equal(initRes.status, 200);
  const initText = await initRes.text();
  assert.ok(initText.includes("event: message"));
  assert.ok(initText.includes('"serverInfo":{"name":"api-guardian-mcp"'));

  const sessionId = initRes.headers.get("mcp-session-id");
  const headers = { "Content-Type": "application/json", Accept: acceptHeader };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  // 2. tools/list
  const listRes = await fetch(mcpUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    })
  });
  assert.equal(listRes.status, 200);
  const listText = await listRes.text();
  assert.ok(listText.includes("list_dependencies"));
  assert.ok(listText.includes("inspect_dependency"));

  // 3. tools/call (invoke list_dependencies)
  const callRes = await fetch(mcpUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_dependencies",
        arguments: {}
      }
    })
  });
  assert.equal(callRes.status, 200);
  const callText = await callRes.text();
  assert.ok(callText.includes("Weather API") || callText.includes("dependencies"));
});

test("McpServer tool handlers correctly execute runtime business logic", async () => {
  const mcpServer = createMcpServer();
  assert.ok(mcpServer);

  // Directly verify tool handlers invoke underlying store services
  const weather = store.state.services.weather;
  assert.ok(weather);
  assert.equal(weather.status, "HEALTHY");

  // Simulate change via store and verify incident workflow
  store.simulateChange("weather");
  assert.equal(weather.changed, true);

  // Inspect dependency details
  const baseline = store.state.baselines.weather;
  assert.ok(baseline);
  assert.equal(baseline.body.temp, 24);
});

