/**
 * Analyzes the downstream blast radius and impact of detected API changes
 * across frontend pages, backend services, and external integrations.
 */
function analyseImpact(serviceId, changes, dependencies) {
  const affectedWorkflows = new Set();
  const frontendPages = new Set();
  const backendServices = new Set();
  const externalIntegrations = new Set();
  const affectedEndpoints = [];
  const details = [];

  let severityCounts = {
    high: 0,
    medium: 0,
    low: 0
  };

  for (const change of changes) {
    const field = change.path;
    const dependencyKey = `${serviceId}.${field}`;
    const depInfo = dependencies[dependencyKey] || [];

    // Support both simple array of strings and rich object configuration
    const workflows = Array.isArray(depInfo) ? depInfo : depInfo.workflows || [];
    const endpoints = depInfo.endpoints || [];

    workflows.forEach((wf) => {
      const name = typeof wf === "string" ? wf : wf.name;
      const type = (typeof wf === "object" && wf.type) || "workflow";
      affectedWorkflows.add(name);

      if (type === "frontend" || name.toLowerCase().includes("page") || name.toLowerCase().includes("dashboard") || name.toLowerCase().includes("search") || name.toLowerCase().includes("cart") || name.toLowerCase().includes("homepage")) {
        frontendPages.add(name);
      } else if (type === "external" || name.toLowerCase().includes("mobile") || name.toLowerCase().includes("third party")) {
        externalIntegrations.add(name);
      } else {
        backendServices.add(name);
      }
    });

    // Endpoint details
    if (endpoints.length > 0) {
      endpoints.forEach((ep) => {
        affectedEndpoints.push(ep);
        if (ep.impact === "High" || ep.impact === "HIGH") severityCounts.high++;
        else if (ep.impact === "Medium" || ep.impact === "MEDIUM") severityCounts.medium++;
        else severityCounts.low++;
      });
    } else {
      // Generate standard endpoint impacts based on change severity
      const impactLevel = change.severity === "BREAKING" ? "High" : change.severity === "PERFORMANCE" ? "Medium" : "Low";
      if (impactLevel === "High") severityCounts.high++;
      else if (impactLevel === "Medium") severityCounts.medium++;
      else severityCounts.low++;

      affectedEndpoints.push({
        endpoint: `/api/${serviceId}/current`,
        service: "Frontend",
        impact: impactLevel,
        description: change.message || `Field "${field}" changed`,
        field
      });
    }

    details.push({
      field,
      changeKind: change.kind,
      severity: change.severity,
      workflows: Array.from(workflows).map((w) => (typeof w === "string" ? w : w.name))
    });
  }

  const totalAffected = frontendPages.size + backendServices.size + externalIntegrations.size;

  return {
    affectedWorkflows: Array.from(affectedWorkflows),
    affectedServicesAndPages: {
      totalAffected: totalAffected || affectedWorkflows.size,
      frontendPages: Array.from(frontendPages),
      backendServices: Array.from(backendServices),
      externalIntegrations: Array.from(externalIntegrations)
    },
    impactSeverity: {
      high: severityCounts.high,
      medium: severityCounts.medium,
      low: severityCounts.low
    },
    affectedEndpoints,
    details,
    totalAffectedWorkflows: affectedWorkflows.size,
    note:
      affectedWorkflows.size === 0
        ? "No direct dependency was found in the configured dependency map; review manually."
        : "Impact is calculated from the registered dependency architecture graph."
  };
}

module.exports = { analyseImpact };
