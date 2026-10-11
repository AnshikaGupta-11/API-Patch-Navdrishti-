const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/server");
const { store } = require("../src/store");
const {
  UserClientV1,
  UserClientV2,
  UserClientCompatAdapter,
  executeDownstreamWorkflow
} = require("../src/sdk-compat");

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

test("SDK client v1 exposes user.name and satisfies downstream workflow", async () => {
  const v1 = new UserClientV1();
  const user = await v1.getUser(101);
  assert.equal(user.name, "Rahul");
  assert.equal(user.displayName, undefined);

  const wfResult = await executeDownstreamWorkflow(v1);
  assert.equal(wfResult.success, true);
  assert.equal(wfResult.greeting, "Welcome back, Rahul!");
});

test("SDK client v2 breaks downstream workflow due to name -> displayName rename", async () => {
  const v2 = new UserClientV2();
  const user = await v2.getUser(101);
  assert.equal(user.name, undefined);
  assert.equal(user.displayName, "Rahul");

  const wfResult = await executeDownstreamWorkflow(v2);
  assert.equal(wfResult.success, false);
  assert.ok(wfResult.error.includes("Cannot read property 'name'"));
});

test("UserClientCompatAdapter safely repairs v2 client for legacy callers", async () => {
  const v2 = new UserClientV2();
  const adapter = new UserClientCompatAdapter(v2);
  const user = await adapter.getUser(101);
  assert.equal(user.name, "Rahul");
  assert.equal(user.displayName, "Rahul");

  const wfResult = await executeDownstreamWorkflow(adapter);
  assert.equal(wfResult.success, true);
  assert.equal(wfResult.greeting, "Welcome back, Rahul!");
});

test("Full SDK scenario REST workflow: upgrade, break, approve adapter, validate, reset", async () => {
  // 1. Initial status
  const status1 = await (await fetch(`${baseUrl}/api/sdk-scenario/status`)).json();
  assert.equal(status1.installedVersion, "v1");

  // 2. Simulate upgrade to v2
  const upgRes = await fetch(`${baseUrl}/api/sdk-scenario/simulate-upgrade`, { method: "POST" });
  assert.equal(upgRes.status, 200);
  const upgData = await upgRes.json();
  assert.equal(upgData.installedVersion, "v2");
  assert.equal(upgData.workflowResult.success, false);

  // 3. Apply adapter without approval should fail
  const noApproveRes = await fetch(`${baseUrl}/api/sdk-scenario/apply-adapter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: false })
  });
  assert.equal(noApproveRes.status, 400);

  // 4. Apply adapter with explicit approval
  const approveRes = await fetch(`${baseUrl}/api/sdk-scenario/apply-adapter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true })
  });
  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.equal(approveData.adapterActive, true);
  assert.equal(approveData.workflowResult.success, true);

  // 5. Run workflow
  const wfRes = await fetch(`${baseUrl}/api/sdk-scenario/run-workflow`, { method: "POST" });
  assert.equal(wfRes.status, 200);
  const wfData = await wfRes.json();
  assert.equal(wfData.workflowResult.success, true);

  // 6. Reset
  const resetRes = await fetch(`${baseUrl}/api/sdk-scenario/reset`, { method: "POST" });
  assert.equal(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.equal(resetData.status.installedVersion, "v1");
});
