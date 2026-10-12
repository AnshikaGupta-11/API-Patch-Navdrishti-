/**
 * Centralized API Client for API Patch Frontend
 * Connects to the Express backend with automatic fallback and error handling.
 */

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3001';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_guardian_token') : null;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errMessage = `HTTP error ${res.status}`;
      try {
        const errorData = await res.json();
        errMessage = errorData.error || errorData.message || errMessage;
      } catch {
        // fallback
      }
      const error = new Error(errMessage);
      error.status = res.status;
      error.data = errorData;
      throw error;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Patch Client] Request failed: ${options.method || 'GET'} ${path}`, err.message);
    throw err;
  }
}

export const apiClient = {
  baseUrl: API_BASE,

  // 0. Authentication (Persistent SQLite Backend)
  register: ({ email, password, name }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    }),
  signup: ({ email, password, name }) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    }),
  login: ({ email, password }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: () => request('/api/auth/me'),
  logout: () =>
    request('/api/auth/logout', {
      method: 'POST'
    }),

  // 1. Health & Dashboard
  getHealth: () => request('/api/health'),
  getDashboard: () => request('/api/dashboard'),

  // 2. Monitored Services & Dependencies
  getServices: () => request('/api/services'),
  getService: (serviceId) => request(`/api/services/${serviceId}`),
  getServiceCurrent: (serviceId) => request(`/api/services/${serviceId}/current`),
  getServiceBaseline: (serviceId) => request(`/api/services/${serviceId}/baseline`),
  simulateChange: (serviceId = 'weather', customPayload = null) =>
    request(`/api/services/${serviceId}/simulate-change`, {
      method: 'POST',
      body: JSON.stringify({ customPayload })
    }),

  // 3. Monitor & Change Detection
  runMonitor: () => request('/api/monitor/run', { method: 'POST' }),
  getChanges: () => request('/api/changes'),

  // 4. Incident Management & Impact
  getIncidents: (params = '') => request(`/api/incidents${params ? `?${params}` : ''}`),
  getIncident: (id) => request(`/api/incidents/${id}`),
  getIncidentImpact: (id) => request(`/api/incidents/${id}/impact`),
  getServiceImpact: async (serviceId) => {
    try {
      const incRes = await request(`/api/incidents?serviceId=${serviceId}`);
      const incident = incRes?.incidents?.[0];
      if (incident?.id) {
        return await request(`/api/incidents/${incident.id}/impact`);
      }
    } catch {
      // fallback
    }
    return null;
  },

  // 5. Safe Repair Proposals & Approval
  proposeFix: (incidentId) => request(`/api/incidents/${incidentId}/propose-fix`, { method: 'POST' }),
  applyFix: (incidentId, approvedBy = 'Human Reviewer') =>
    request(`/api/incidents/${incidentId}/apply-fix`, {
      method: 'POST',
      body: JSON.stringify({ approved: true, approvedBy })
    }),
  rejectFix: (incidentId, reason = 'Flagged for manual review') =>
    request(`/api/incidents/${incidentId}/reject-fix`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
  rollback: (incidentId) => request(`/api/incidents/${incidentId}/rollback`, { method: 'POST' }),

  // 6. Regression Testing & Validation
  validateIncident: async (incidentId) => {
    try {
      return await request(`/api/incidents/${incidentId}/validate`, { method: 'POST' });
    } catch (err) {
      if (err.status === 422 && err.data?.validation) {
        return err.data;
      }
      throw err;
    }
  },

  // 7. Proxy Gateway Verification
  getProxy: (serviceId) => request(`/api/proxy/${serviceId}`),

  // 8. Demo Reset
  resetDemo: () => request('/api/demo/reset', { method: 'POST' }),

  // 9. Multi-Dependency Sandbox Registry & Graph
  getDependencies: () => request('/api/dependencies'),
  getDependenciesGraph: () => request('/api/dependencies/graph'),

  // 10. Webhooks
  getWebhookHistory: () => request('/api/webhooks/history'),
  simulateWebhook: (eventType = 'dependency.changed', dependencyId = 'weather', payload = null) =>
    request('/api/webhooks/simulate', {
      method: 'POST',
      body: JSON.stringify({ eventType, dependencyId, payload })
    }),

  // 11. Model Context Protocol (MCP) Server Info & Tools
  getMcpInfo: () => request('/api/mcp/info'),
  getMcpTools: () => request('/api/mcp/tools'),

  // 12. SDK Version Compatibility Scenario
  getSdkStatus: () => request('/api/sdk-scenario/status'),
  simulateSdkUpgrade: () => request('/api/sdk-scenario/simulate-upgrade', { method: 'POST' }),
  applySdkAdapter: (approved = true) =>
    request('/api/sdk-scenario/apply-adapter', {
      method: 'POST',
      body: JSON.stringify({ approved })
    }),
  runSdkWorkflow: () => request('/api/sdk-scenario/run-workflow', { method: 'POST' }),
  resetSdkScenario: () => request('/api/sdk-scenario/reset', { method: 'POST' })
};
