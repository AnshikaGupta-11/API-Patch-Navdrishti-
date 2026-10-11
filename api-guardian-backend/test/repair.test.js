const test = require("node:test");
const assert = require("node:assert/strict");
const { initialState } = require("../src/store");
const { proposeRepair, applyRepair, rollbackRepair, validateIncident } = require("../src/repair");
const { detectChanges } = require("../src/detector");
const { analyseImpact } = require("../src/impact");

test("known users rename can be proposed, approved, applied and validated", () => {
  const state = initialState();
  state.services.users.current = { statusCode: 200, body: { id: 1, display_name: "Rahul" } };
  const changes = detectChanges(state.baselines.users, state.services.users.current);
  const incident = {
    id: "INC-TEST",
    serviceId: "users",
    serviceName: "Users API",
    changes,
    impact: analyseImpact("users", changes, state.dependencies),
    repairProposal: null,
    validation: null
  };

  const proposal = proposeRepair(incident, state);
  assert.equal(proposal.ok, true);
  incident.repairProposal = proposal.proposal;
  assert.equal(applyRepair(incident, state).ok, false, "approval is required");

  incident.repairProposal.approved = true;
  assert.equal(applyRepair(incident, state).ok, true);

  const result = validateIncident(incident, state);
  assert.equal(result.passed, true);
  assert.equal(result.summary.failedChecks, 0);
});

test("weather API rename (temp->temperature, city->city_name) is safely repaired and validated", () => {
  const state = initialState();
  state.services.weather.current = {
    statusCode: 200,
    body: {
      temperature: 24,
      condition: "Sunny",
      humidity: 45,
      city_name: "Indore"
    }
  };
  const changes = detectChanges(state.baselines.weather, state.services.weather.current);
  const incident = {
    id: "INC-WEATHER",
    serviceId: "weather",
    serviceName: "Weather API",
    changes,
    impact: analyseImpact("weather", changes, state.dependencies),
    repairProposal: null,
    validation: null
  };

  const proposal = proposeRepair(incident, state);
  assert.equal(proposal.ok, true);
  assert.equal(proposal.proposal.serviceId, "weather");
  assert.ok(proposal.proposal.diff.includes("temperature"));

  incident.repairProposal = proposal.proposal;
  // Approval enforcement
  assert.equal(applyRepair(incident, state).ok, false);

  incident.repairProposal.approved = true;
  assert.equal(applyRepair(incident, state).ok, true);

  const result = validateIncident(incident, state);
  assert.equal(result.passed, true);
  assert.equal(result.normalizedResponse.body.temp, 24);
  assert.equal(result.normalizedResponse.body.city, "Indore");
});

test("repair rollback restores unadapted state", () => {
  const state = initialState();
  state.services.users.current = { statusCode: 200, body: { id: 1, display_name: "Rahul" } };
  const incident = {
    id: "INC-ROLLBACK",
    serviceId: "users",
    changes: [],
    repairProposal: {
      serviceId: "users",
      mappings: [{ from: "display_name", to: "name" }],
      approved: true
    }
  };

  applyRepair(incident, state);
  assert.ok(state.adapters.users);

  const rollbackResult = rollbackRepair(incident, state);
  assert.equal(rollbackResult.ok, true);
  assert.equal(state.adapters.users, undefined);
  assert.equal(incident.status, "ROLLED_BACK");
});

test("ambiguous changes are not auto-repaired", () => {
  const state = initialState();
  state.services.products.current = { statusCode: 200, body: { id: 101, title: "Notebook", price: "50" } };
  const changes = detectChanges(state.baselines.products, state.services.products.current);
  const incident = { serviceId: "products", changes };
  const proposal = proposeRepair(incident, state);
  assert.equal(proposal.ok, false);
  assert.ok(proposal.error.includes("Manual review is required"));
});
