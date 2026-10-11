const { store } = require("./store");
const { detectChanges } = require("./detector");
const { analyseImpact } = require("./impact");
const { proposeRepair, applyRepair, validateIncident } = require("./repair");

/**
 * SDK Version Compatibility Engine
 *
 * Demonstrates real-world SDK client breaking change:
 * - SDK v1 exposes `user.name`
 * - SDK v2 exposes `user.displayName` (breaking downstream callers that expect `name`)
 * - UserClientCompatAdapter normalizes v2 responses to satisfy the legacy v1 contract
 */

class UserClientV1 {
  constructor() {
    this.version = "1.0.0";
  }

  async getUser(id = 1) {
    return {
      id: Number(id),
      name: "Rahul",
      email: "rahul@internal.org",
      sdkVersion: "v1.0.0"
    };
  }
}

class UserClientV2 {
  constructor() {
    this.version = "2.0.0";
  }

  async getUser(id = 1) {
    // Breaking change in v2: 'name' renamed to 'displayName'
    return {
      id: Number(id),
      displayName: "Rahul",
      email: "rahul@internal.org",
      sdkVersion: "v2.0.0"
    };
  }
}

class UserClientCompatAdapter {
  constructor(v2Client) {
    this.client = v2Client;
    this.adapterVersion = "1.0.0-compat";
  }

  async getUser(id = 1) {
    const data = await this.client.getUser(id);
    return {
      ...data,
      name: data.displayName || data.name,
      _adapted: true
    };
  }
}

/**
 * Downstream application workflow simulating consumer code that depends on the SDK.
 */
async function executeDownstreamWorkflow(client) {
  const start = Date.now();
  const user = await client.getUser(1);

  // Downstream consumer expects 'name'
  if (user.name === undefined) {
    return {
      success: false,
      workflow: "User Profile Display & Greeting Service",
      error: "TypeError: Cannot read property 'name' of user (received 'displayName' instead)",
      breakageType: "MISSING_FIELD_SDK_V2",
      observedUser: user,
      durationMs: Date.now() - start
    };
  }

  return {
    success: true,
    workflow: "User Profile Display & Greeting Service",
    greeting: `Welcome back, ${user.name}!`,
    user,
    durationMs: Date.now() - start
  };
}

// Runtime state for the SDK scenario
let activeSdkState = {
  installedVersion: "v1", // 'v1' | 'v2'
  adapterActive: false,
  lastWorkflowResult: null
};

function getSdkScenarioStatus() {
  const client = activeSdkState.adapterActive
    ? new UserClientCompatAdapter(new UserClientV2())
    : activeSdkState.installedVersion === "v2"
    ? new UserClientV2()
    : new UserClientV1();

  return {
    installedVersion: activeSdkState.installedVersion,
    adapterActive: activeSdkState.adapterActive,
    clientType: client.constructor.name,
    lastWorkflowResult: activeSdkState.lastWorkflowResult,
    contract: {
      expectedKey: "user.name",
      v1Key: "name",
      v2Key: "displayName"
    }
  };
}

async function simulateSdkUpgrade() {
  activeSdkState.installedVersion = "v2";
  activeSdkState.adapterActive = false;

  // Sync with store's users service
  const usersService = store.state.services.users;
  if (usersService) {
    usersService.current = {
      statusCode: 200,
      body: { id: 1, displayName: "Rahul" }
    };
    usersService.changed = true;
    usersService.status = "CHANGE_SIMULATED";
    usersService.lastObservedAt = new Date().toISOString();

    store.logActivity({
      serviceId: "users",
      serviceName: "Users SDK Client",
      type: "CHANGED",
      badge: "breaking",
      message: "Users SDK upgraded v1 -> v2 (breaking change: name -> displayName)"
    });
  }

  // Trigger detection and create incident in store
  const baseline = store.state.baselines.users;
  const changes = detectChanges(baseline, usersService.current);
  const impact = analyseImpact("users", changes, store.state.dependencies);
  const incidentNumber = String(store.state.nextIncidentNumber++).padStart(3, "0");

  const incident = {
    id: `INC-${incidentNumber}`,
    serviceId: "users",
    serviceName: "Users API & SDK",
    status: "DETECTED",
    severity: "HIGH",
    changes,
    impact,
    repairProposal: null,
    validation: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.state.incidents.unshift(incident);
  store.save();

  // Run downstream workflow with the unadapted v2 client to observe the break
  const client = new UserClientV2();
  activeSdkState.lastWorkflowResult = await executeDownstreamWorkflow(client);

  return {
    installedVersion: "v2",
    adapterActive: false,
    incidentId: incident.id,
    workflowResult: activeSdkState.lastWorkflowResult
  };
}

async function applySdkAdapter(approved = true) {
  if (!approved) {
    throw new Error("Explicit human approval is required to activate SDK compatibility adapter");
  }

  activeSdkState.adapterActive = true;

  // Find or create incident
  let incident = store.state.incidents.find((i) => i.serviceId === "users");
  if (!incident) {
    const changes = detectChanges(store.state.baselines.users, store.state.services.users.current);
    incident = {
      id: `INC-${String(store.state.nextIncidentNumber++).padStart(3, "0")}`,
      serviceId: "users",
      serviceName: "Users API & SDK",
      status: "DETECTED",
      changes
    };
    store.state.incidents.unshift(incident);
  }

  const propResult = proposeRepair(incident, store.state);
  if (propResult.ok) {
    incident.repairProposal = propResult.proposal;
    incident.repairProposal.approved = true;
    incident.repairProposal.approvedAt = new Date().toISOString();
    incident.repairProposal.approvedBy = "Lead SDK Engineer";
    applyRepair(incident, store.state);
  }

  // Validate the fix
  const valResult = validateIncident(incident, store.state);
  incident.validation = valResult;
  incident.status = valResult.passed ? "VALIDATED" : "VALIDATION_FAILED";

  const client = new UserClientCompatAdapter(new UserClientV2());
  activeSdkState.lastWorkflowResult = await executeDownstreamWorkflow(client);

  store.save();

  return {
    installedVersion: "v2",
    adapterActive: true,
    incident,
    validation: valResult,
    workflowResult: activeSdkState.lastWorkflowResult
  };
}

async function runSdkWorkflow() {
  const client = activeSdkState.adapterActive
    ? new UserClientCompatAdapter(new UserClientV2())
    : activeSdkState.installedVersion === "v2"
    ? new UserClientV2()
    : new UserClientV1();

  const result = await executeDownstreamWorkflow(client);
  activeSdkState.lastWorkflowResult = result;
  return result;
}

function resetSdkScenario() {
  activeSdkState = {
    installedVersion: "v1",
    adapterActive: false,
    lastWorkflowResult: null
  };
  return getSdkScenarioStatus();
}

module.exports = {
  UserClientV1,
  UserClientV2,
  UserClientCompatAdapter,
  executeDownstreamWorkflow,
  getSdkScenarioStatus,
  simulateSdkUpgrade,
  applySdkAdapter,
  runSdkWorkflow,
  resetSdkScenario
};
