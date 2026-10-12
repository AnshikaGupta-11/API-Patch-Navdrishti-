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
      baseUrl = "http://127.0.0.1:" + port;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("Scenario A: 2 services broken -> resolve Users -> count drops 2->1 -> resolve Weather -> count drops 1->0", async () => {
  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  const simUsers = await fetch(baseUrl + "/api/services/users/simulate-change", { method: "POST" });
  assert.equal(simUsers.status, 200);

  const simWeather = await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  assert.equal(simWeather.status, 200);

  const monRes = await fetch(baseUrl + "/api/monitor/run", { method: "POST" });
  assert.equal(monRes.status, 200);

  const chgRes1 = await fetch(baseUrl + "/api/changes");
  assert.equal(chgRes1.status, 200);
  const chgData1 = await chgRes1.json();
  assert.equal(chgData1.unresolvedCount, 2);
  assert.equal(chgData1.changes.length, 2);
  const serviceIds1 = chgData1.changes.map((c) => c.serviceId);
  assert.ok(serviceIds1.includes("users"));
  assert.ok(serviceIds1.includes("weather"));

  const dashRes1 = await fetch(baseUrl + "/api/dashboard");
  const dashData1 = await dashRes1.json();
  assert.equal(dashData1.stats.apisWithChanges, 2);

  const incResUsers = await fetch(baseUrl + "/api/incidents?serviceId=users");
  const incDataUsers = await incResUsers.json();
  const usersIncident = incDataUsers.incidents.find((i) => i.serviceId === "users");
  assert.ok(usersIncident, "Users incident must exist");

  const propUsers = await fetch(baseUrl + "/api/incidents/" + usersIncident.id + "/propose-fix", { method: "POST" });
  assert.equal(propUsers.status, 200);

  const applyUsers = await fetch(baseUrl + "/api/incidents/" + usersIncident.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA Automated Runner" })
  });
  assert.equal(applyUsers.status, 200);

  const valUsers = await fetch(baseUrl + "/api/incidents/" + usersIncident.id + "/validate", { method: "POST" });
  assert.equal(valUsers.status, 200);
  const valUsersData = await valUsers.json();
  assert.equal(valUsersData.validation.passed, true);
  assert.equal(valUsersData.incident.status, "VALIDATED");

  const chgRes2 = await fetch(baseUrl + "/api/changes");
  const chgData2 = await chgRes2.json();
  assert.equal(chgData2.unresolvedCount, 1);
  assert.equal(chgData2.changes.length, 1);
  assert.equal(chgData2.changes[0].serviceId, "weather");

  const dashRes2 = await fetch(baseUrl + "/api/dashboard");
  const dashData2 = await dashRes2.json();
  assert.equal(dashData2.stats.apisWithChanges, 1);

  const incResWeather = await fetch(baseUrl + "/api/incidents?serviceId=weather");
  const incDataWeather = await incResWeather.json();
  const weatherIncident = incDataWeather.incidents.find((i) => i.serviceId === "weather");
  assert.ok(weatherIncident, "Weather incident must exist");

  const propWeather = await fetch(baseUrl + "/api/incidents/" + weatherIncident.id + "/propose-fix", { method: "POST" });
  assert.equal(propWeather.status, 200);

  const applyWeather = await fetch(baseUrl + "/api/incidents/" + weatherIncident.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA Automated Runner" })
  });
  assert.equal(applyWeather.status, 200);

  const valWeather = await fetch(baseUrl + "/api/incidents/" + weatherIncident.id + "/validate", { method: "POST" });
  assert.equal(valWeather.status, 200);
  const valWeatherData = await valWeather.json();
  assert.equal(valWeatherData.validation.passed, true);
  assert.equal(valWeatherData.incident.status, "VALIDATED");

  const chgRes3 = await fetch(baseUrl + "/api/changes");
  const chgData3 = await chgRes3.json();
  assert.equal(chgData3.unresolvedCount, 0, "Unresolved count must be 0 after resolving final API");
  assert.equal(chgData3.changes.length, 0, "Changes array must be empty");

  const dashRes3 = await fetch(baseUrl + "/api/dashboard");
  const dashData3 = await dashRes3.json();
  assert.equal(dashData3.stats.apisWithChanges, 0, "Dashboard apisWithChanges must be 0");
  assert.equal(dashData3.openIncidentsCount, 0);

  const monRes2 = await fetch(baseUrl + "/api/monitor/run", { method: "POST" });
  assert.equal(monRes2.status, 200);
  const monData2 = await monRes2.json();
  assert.equal(monData2.totalOpenIncidents, 0, "Monitor run must report 0 open incidents");

  const chgRes4 = await fetch(baseUrl + "/api/changes");
  const chgData4 = await chgRes4.json();
  assert.equal(chgData4.unresolvedCount, 0, "Changes must remain 0 after monitor run");

  const allIncRes = await fetch(baseUrl + "/api/incidents");
  const allIncData = await allIncRes.json();
  const weatherResolved = allIncData.incidents.find((i) => i.serviceId === "weather" && i.status === "VALIDATED");
  const usersResolved = allIncData.incidents.find((i) => i.serviceId === "users" && i.status === "VALIDATED");
  assert.ok(weatherResolved, "Resolved Weather incident must remain in history");
  assert.ok(usersResolved, "Resolved Users incident must remain in history");
});

test("Scenario B: Solitary Weather API change resolves cleanly to 0 with no persistence", async () => {
  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chgRes1 = await fetch(baseUrl + "/api/changes");
  const chgData1 = await chgRes1.json();
  assert.equal(chgData1.unresolvedCount, 1);
  assert.equal(chgData1.changes[0].serviceId, "weather");

  const incRes = await fetch(baseUrl + "/api/incidents?serviceId=weather");
  const incData = await incRes.json();
  const incident = incData.incidents[0];

  await fetch(baseUrl + "/api/incidents/" + incident.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incident.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA Automated Runner" })
  });
  const valRes = await fetch(baseUrl + "/api/incidents/" + incident.id + "/validate", { method: "POST" });
  assert.equal(valRes.status, 200);

  const chgRes2 = await fetch(baseUrl + "/api/changes");
  const chgData2 = await chgRes2.json();
  assert.equal(chgData2.unresolvedCount, 0);
  assert.equal(chgData2.changes.length, 0);
  assert.ok(!chgData2.changes.some((c) => c.serviceId === "weather"));

  const srvRes = await fetch(baseUrl + "/api/services");
  const srvData = await srvRes.json();
  const weatherSrv = srvData.services.find((s) => s.id === "weather");
  assert.equal(weatherSrv.status, "HEALTHY");
  assert.equal(weatherSrv.changed, false);
});

test("Scenario C: Validation failure preserves incident as unresolved and count does not drop", async () => {
  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chgRes1 = await fetch(baseUrl + "/api/changes");
  const chgData1 = await chgRes1.json();
  assert.equal(chgData1.unresolvedCount, 1);

  const incRes = await fetch(baseUrl + "/api/incidents?serviceId=weather");
  const incData = await incRes.json();
  const incident = incData.incidents[0];

  const valRes = await fetch(baseUrl + "/api/incidents/" + incident.id + "/validate", { method: "POST" });
  assert.equal(valRes.status, 422, "Validation without adapter must fail with 422");
  const valData = await valRes.json();
  assert.equal(valData.validation.passed, false);
  assert.equal(valData.incident.status, "VALIDATION_FAILED");

  const chgRes2 = await fetch(baseUrl + "/api/changes");
  const chgData2 = await chgRes2.json();
  assert.equal(chgData2.unresolvedCount, 1, "Unresolved count must NOT drop on validation failure");
  assert.equal(chgData2.changes.length, 1);
  assert.equal(chgData2.changes[0].serviceId, "weather");

  const dashRes = await fetch(baseUrl + "/api/dashboard");
  const dashData = await dashRes.json();
  assert.equal(dashData.stats.apisWithChanges, 1);
});

test("Scenario D: Demo reset and repeated simulate-resolve cycle is 100% idempotent", async () => {
  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  const chgInitial = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgInitial.unresolvedCount, 0, "Clean reset must produce 0 unresolved changes");

  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/services/users/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chgC1 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgC1.unresolvedCount, 2);

  const incsC1W = await (await fetch(baseUrl + "/api/incidents?serviceId=weather")).json();
  const incW1 = incsC1W.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incW1.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incW1.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incW1.id + "/validate", { method: "POST" });

  const incsC1U = await (await fetch(baseUrl + "/api/incidents?serviceId=users")).json();
  const incU1 = incsC1U.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incU1.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incU1.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incU1.id + "/validate", { method: "POST" });

  const chgC1Resolved = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgC1Resolved.unresolvedCount, 0, "Cycle 1 must reach 0");

  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  const chgReset2 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgReset2.unresolvedCount, 0, "Second reset must produce 0 unresolved changes");

  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/services/users/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chgC2 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgC2.unresolvedCount, 2);

  const incsC2W = await (await fetch(baseUrl + "/api/incidents?serviceId=weather")).json();
  const incW2 = incsC2W.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incW2.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incW2.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incW2.id + "/validate", { method: "POST" });

  const chgC2Mid = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgC2Mid.unresolvedCount, 1, "After resolving 1 in cycle 2, count is 1");

  const incsC2U = await (await fetch(baseUrl + "/api/incidents?serviceId=users")).json();
  const incU2 = incsC2U.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incU2.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incU2.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incU2.id + "/validate", { method: "POST" });

  const chgC2Final = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgC2Final.unresolvedCount, 0, "Cycle 2 must reach 0 cleanly");

  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });
});

test("Scenario E: Multi-service simulation across Weather, Users, Payments with duplicate safety and 3->2->1->0 resolution", async () => {
  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });

  // 1. Simulate Weather API
  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chg1 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chg1.unresolvedCount, 1);
  assert.equal(chg1.changes[0].serviceId, "weather");

  // 2. Duplicate simulation attempt on Weather: should NOT create a second open incident
  await fetch(baseUrl + "/api/services/weather/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chgDup = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgDup.unresolvedCount, 1, "Duplicate simulation must not increase unresolved count");

  // 3. Auto-rotate / simulate Users API
  await fetch(baseUrl + "/api/services/users/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chg2 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chg2.unresolvedCount, 2);
  const ids2 = chg2.changes.map(c => c.serviceId);
  assert.ok(ids2.includes("weather"));
  assert.ok(ids2.includes("users"));

  // 4. Auto-rotate / simulate Payments API
  await fetch(baseUrl + "/api/services/payments/simulate-change", { method: "POST" });
  await fetch(baseUrl + "/api/monitor/run", { method: "POST" });

  const chg3 = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chg3.unresolvedCount, 3);
  const ids3 = chg3.changes.map(c => c.serviceId);
  assert.ok(ids3.includes("weather"));
  assert.ok(ids3.includes("users"));
  assert.ok(ids3.includes("payments"));

  // 5. Resolve Payments API -> drops from 3 to 2
  const incsPay = await (await fetch(baseUrl + "/api/incidents?serviceId=payments")).json();
  const incPay = incsPay.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incPay.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incPay.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incPay.id + "/validate", { method: "POST" });

  const chgAfterPay = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgAfterPay.unresolvedCount, 2, "After resolving Payments, count is 2");

  // 6. Resolve Weather API -> drops from 2 to 1
  const incsW = await (await fetch(baseUrl + "/api/incidents?serviceId=weather")).json();
  const incW = incsW.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incW.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incW.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incW.id + "/validate", { method: "POST" });

  const chgAfterW = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgAfterW.unresolvedCount, 1, "After resolving Weather, count is 1");

  // 7. Resolve Users API -> drops from 1 to 0
  const incsU = await (await fetch(baseUrl + "/api/incidents?serviceId=users")).json();
  const incU = incsU.incidents[0];
  await fetch(baseUrl + "/api/incidents/" + incU.id + "/propose-fix", { method: "POST" });
  await fetch(baseUrl + "/api/incidents/" + incU.id + "/apply-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true, approvedBy: "QA" })
  });
  await fetch(baseUrl + "/api/incidents/" + incU.id + "/validate", { method: "POST" });

  const chgAfterU = await (await fetch(baseUrl + "/api/changes")).json();
  assert.equal(chgAfterU.unresolvedCount, 0, "After resolving Users, count is 0 cleanly");

  await fetch(baseUrl + "/api/demo/reset", { method: "POST" });
});
