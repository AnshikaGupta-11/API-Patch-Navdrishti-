const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("../src/server");
const { store } = require("../src/store");

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

test("GET /api/health returns ok", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");
  assert.equal(data.name, "API Guardian Backend");
});

test("GET /api/dashboard returns stats and monitored services", async () => {
  const res = await fetch(`${baseUrl}/api/dashboard`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.stats);
  assert.ok(data.stats.totalApis >= 5);
  assert.ok(Array.isArray(data.monitoredApis));
  assert.ok(Array.isArray(data.recentActivity));
});

test("GET /api/services lists all registered services", async () => {
  const res = await fetch(`${baseUrl}/api/services`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.services));
  const ids = data.services.map((s) => s.id);
  assert.ok(ids.includes("weather"));
  assert.ok(ids.includes("users"));
  assert.ok(ids.includes("products"));
});

test("Full workflow: simulate change, detect, inspect impact, propose repair, approve, validate", async () => {
  // 1. Reset
  await fetch(`${baseUrl}/api/demo/reset`, { method: "POST" });

  // 2. Simulate change on Weather API
  const simRes = await fetch(`${baseUrl}/api/services/weather/simulate-change`, {
    method: "POST"
  });
  assert.equal(simRes.status, 200);

  // 3. Run monitor
  const monRes = await fetch(`${baseUrl}/api/monitor/run`, { method: "POST" });
  assert.equal(monRes.status, 200);
  const monData = await monRes.json();
  assert.ok(monData.incidents.length > 0);

  const weatherIncident = monData.incidents.find((i) => i.serviceId === "weather");
  assert.ok(weatherIncident);
  assert.equal(weatherIncident.status, "DETECTED");

  // 4. Inspect impact
  const impactRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/impact`);
  assert.equal(impactRes.status, 200);
  const impactData = await impactRes.json();
  assert.ok(impactData.impact.affectedServicesAndPages);
  assert.ok(impactData.impact.affectedWorkflows.length > 0);

  // 5. Propose fix
  const propRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/propose-fix`, {
    method: "POST"
  });
  assert.equal(propRes.status, 200);
  const propData = await propRes.json();
  assert.equal(propData.incident.status, "REPAIR_PROPOSED");
  assert.equal(propData.incident.repairProposal.requiresHumanApproval, true);

  // 6. Attempt applying fix without approval -> should fail safely (400)
  const rejectRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/apply-fix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: false })
  });
  assert.equal(rejectRes.status, 400);

  // 7. Apply fix with explicit approval
  const approveRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/apply-fix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "Security Lead" })
  });
  assert.equal(approveRes.status, 200);

  // 8. Validate incident through regression tests
  const valRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/validate`, {
    method: "POST"
  });
  assert.equal(valRes.status, 200);
  const valData = await valRes.json();
  assert.equal(valData.validation.passed, true);
  assert.equal(valData.incident.status, "VALIDATED");

  // 9. Verify live proxy delivers normalized schema
  const proxyRes = await fetch(`${baseUrl}/api/proxy/weather`);
  assert.equal(proxyRes.status, 200);
  const proxyBody = await proxyRes.json();
  assert.equal(proxyBody.temp, 24);
  assert.equal(proxyBody.city, "Indore");

  // 10. Rollback fix
  const rollRes = await fetch(`${baseUrl}/api/incidents/${weatherIncident.id}/rollback`, {
    method: "POST"
  });
  assert.equal(rollRes.status, 200);
  const rollData = await rollRes.json();
  assert.equal(rollData.incident.status, "ROLLED_BACK");
});

test("Full workflow for Users API: simulate change (name -> display_name), detect, inspect impact, propose repair, verify approval required, apply fix, validate 5 suites, verify proxy /api/proxy/users, rollback", async () => {
  // 1. Reset
  await fetch(`${baseUrl}/api/demo/reset`, { method: "POST" });

  // 2. Simulate change on Users API
  const simRes = await fetch(`${baseUrl}/api/services/users/simulate-change`, {
    method: "POST"
  });
  assert.equal(simRes.status, 200);

  // 3. Run monitor
  const monRes = await fetch(`${baseUrl}/api/monitor/run`, { method: "POST" });
  assert.equal(monRes.status, 200);
  const monData = await monRes.json();
  assert.ok(monData.incidents.length > 0);

  const usersIncident = monData.incidents.find((i) => i.serviceId === "users");
  assert.ok(usersIncident);
  assert.equal(usersIncident.status, "DETECTED");

  // 4. Inspect impact
  const impactRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/impact`);
  assert.equal(impactRes.status, 200);
  const impactData = await impactRes.json();
  assert.ok(impactData.impact.affectedWorkflows.length > 0);

  // 5. Propose fix
  const propRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/propose-fix`, {
    method: "POST"
  });
  assert.equal(propRes.status, 200);
  const propData = await propRes.json();
  assert.equal(propData.incident.status, "REPAIR_PROPOSED");
  assert.equal(propData.incident.repairProposal.requiresHumanApproval, true);

  // 6. Attempt applying fix without approval -> should fail safely (400)
  const rejectRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/apply-fix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: false })
  });
  assert.equal(rejectRes.status, 400);

  // 7. Apply fix with explicit approval
  const approveRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/apply-fix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA Automation" })
  });
  assert.equal(approveRes.status, 200);

  // 8. Validate incident through regression tests
  const valRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/validate`, {
    method: "POST"
  });
  assert.equal(valRes.status, 200);
  const valData = await valRes.json();
  assert.equal(valData.validation.passed, true);
  assert.equal(valData.incident.status, "VALIDATED");

  // 9. Verify live proxy delivers normalized schema
  const proxyRes = await fetch(`${baseUrl}/api/proxy/users`);
  assert.equal(proxyRes.status, 200);
  const proxyBody = await proxyRes.json();
  assert.equal(proxyBody.id, 1);
  assert.equal(proxyBody.name, "Rahul");

  // 10. Rollback fix
  const rollRes = await fetch(`${baseUrl}/api/incidents/${usersIncident.id}/rollback`, {
    method: "POST"
  });
  assert.equal(rollRes.status, 200);
  const rollData = await rollRes.json();
  assert.equal(rollData.incident.status, "ROLLED_BACK");
});

