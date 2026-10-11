# API Guardian — Backend (Node.js & Express)

API Guardian is an automated API contract resilience engine that detects breaking changes in external and microservice APIs, evaluates downstream blast radius / dependency impacts, generates safe compatibility repair proposals requiring explicit human approval, runs comprehensive regression tests, and maintains full incident history.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or newer (tested on Node v24)
- **npm**: v9 or newer

### Installation
From the project root:
```bash
npm install
```

### Start Backend Server
```bash
npm start
```
*Or during development with hot reload:*
```bash
npm run dev
```
The server starts on `http://localhost:3001` with CORS enabled for frontend clients.

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Run Automated Tests
```bash
npm test
```
All unit tests and end-to-end integration tests use Node's built-in test runner (`node --test`).

---

## 📌 Monitored Demo Services
The backend comes pre-seeded with simulated services matching both the starter flow and the full Hackathon UI:
1. **Weather API** (`weather`): `https://api.weather.com/v1/current` (Breaking rename: `temp` -> `temperature`, `city` -> `city_name`)
2. **Users API** (`users`): `https://api.internal.org/v1/users/1` (Breaking rename: `name` -> `display_name`)
3. **Products API** (`products`): `https://api.catalog.internal/v1/products/101` (Type change: `price` string vs number)
4. **Payments API** (`payments`): `https://api.checkout.internal/v1/payments/ORD-1` (Status change: `PAID` -> `PROCESSING`)
5. **GitHub API** (`github`): `https://api.github.com/v3` (Minor header addition)
6. **Stripe API** (`stripe`): `https://api.stripe.com/v1/charges` (Latency degradation: 220ms -> 480ms)
7. **OpenAI API** (`openai`): `https://api.openai.com/v1/models` (Healthy reference)

---

## 🔄 Recommended Demo Flow

### Weather API Scenario (Matches UI Mockup Screen)
1. **Dashboard Overview**: `GET /api/dashboard`
2. **Simulate Breaking Change**: `POST /api/services/weather/simulate-change`
3. **Detect Changes**: `POST /api/monitor/run`
4. **Inspect Changes**: `GET /api/changes`
5. **View Impact Analysis**: `GET /api/incidents/INC-001/impact`
6. **Generate Safe Repair Proposal**: `POST /api/incidents/INC-001/propose-fix`
7. **Approve & Apply Adapter**: `POST /api/incidents/INC-001/apply-fix` with `{ "approved": true }`
8. **Validate Regression Suite**: `POST /api/incidents/INC-001/validate`
9. **Test Live Proxy Output**: `GET /api/proxy/weather` (returns schema normalized with `temp` and `city`)
10. **Reset Demo Anytime**: `POST /api/demo/reset`

---

## 📡 API Reference for Frontend Integration

### 1. Dashboard & Monitoring

#### `GET /api/dashboard`
Returns high-level statistics, monitored services list, and chronological activity feed.
```json
{
  "stats": {
    "totalApis": 7,
    "apisWithChanges": 1,
    "healthyApis": 6,
    "avgResponseTimeMs": 248
  },
  "monitoredApis": [
    {
      "id": "weather",
      "name": "Weather API",
      "endpoint": "https://api.weather.com/v1/current",
      "status": "DEGRADED",
      "changed": true,
      "uptime": "97.4%",
      "responseTimeMs": 480,
      "lastCheckedAt": "2026-10-10T21:45:00.000Z"
    }
  ],
  "recentActivity": [
    {
      "id": "act-1",
      "serviceId": "weather",
      "serviceName": "Weather API",
      "type": "CHANGED",
      "badge": "breaking",
      "message": "Weather API contract change detected (2 change(s))",
      "timestamp": "2026-10-10T21:45:00.000Z"
    }
  ],
  "openIncidentsCount": 1
}
```

#### `GET /api/services`
List all monitored services with status, uptime, and last observed timestamp.

#### `GET /api/services/:serviceId`
Get single service metadata, baseline contract, and active adapter (if any).

#### `GET /api/services/:serviceId/baseline`
Returns the expected baseline response and required fields list.

#### `GET /api/services/:serviceId/current`
Returns current observed payload and normalized body (if an adapter is enabled).

#### `POST /api/services/:serviceId/simulate-change`
Simulates a contract change on the selected service. Optional payload: `{ "customPayload": { ... } }`.

#### `POST /api/monitor/run`
Compares current observed responses against registered baselines. Creates or updates incidents.
```json
{
  "message": "Monitoring run completed",
  "summary": [
    {
      "serviceId": "weather",
      "serviceName": "Weather API",
      "changed": true,
      "changes": [
        {
          "kind": "FIELD_RENAMED",
          "path": "temp",
          "targetPath": "temperature",
          "severity": "BREAKING",
          "message": "Field \"temp\" renamed to \"temperature\""
        }
      ]
    }
  ],
  "incidents": [ ... ],
  "totalOpenIncidents": 1
}
```

#### `GET /api/changes`
Returns side-by-side comparison (`previousResponse` vs `currentResponse`) and detected changes across all degraded services.

---

### 2. Incident Management

#### `GET /api/incidents`
Query params: `status`, `severity`, `serviceId`.
Returns list of all recorded incidents with full audit history.

#### `GET /api/incidents/:id`
Returns a single incident by ID (`INC-001`).

#### `GET /api/incidents/:id/impact`
Returns blast radius and dependency analysis categorized for the UI:
```json
{
  "incidentId": "INC-001",
  "serviceId": "weather",
  "impact": {
    "affectedWorkflows": [
      "Weather Dashboard",
      "Homepage",
      "Notification Service",
      "City Search",
      "Mobile App"
    ],
    "affectedServicesAndPages": {
      "totalAffected": 5,
      "frontendPages": ["Weather Dashboard", "Homepage", "City Search"],
      "backendServices": ["Notification Service"],
      "externalIntegrations": ["Mobile App"]
    },
    "impactSeverity": {
      "high": 3,
      "medium": 2,
      "low": 0
    },
    "affectedEndpoints": [
      {
        "endpoint": "GET /weather/current",
        "service": "Frontend",
        "impact": "High",
        "description": "Missing field: temp -> temperature"
      }
    ]
  }
}
```

---

### 3. Safe Repair & Explicit Approval

#### `POST /api/incidents/:id/propose-fix`
Generates a safe compatibility repair proposal with code snippet and diff view.
```json
{
  "incident": { "id": "INC-001", "status": "REPAIR_PROPOSED" },
  "proposal": {
    "type": "FIELD_MAPPING",
    "serviceId": "weather",
    "diff": "Update your code to use the new field names:\n- temp: data.temp\n+ temperature: data.temperature",
    "adapterCode": "function adapt(data) { ... }",
    "rationale": "Upstream Weather API renamed temp to temperature. Adapter maps fields back.",
    "risk": "LOW",
    "requiresHumanApproval": true,
    "approved": false
  }
}
```

#### `POST /api/incidents/:id/apply-fix`
**Safety Guard**: Requires explicit approval in the request body. If `{ "approved": true }` is omitted, the API responds with HTTP 400.
```json
// Request Body
{
  "approved": true,
  "approvedBy": "Lead Engineer"
}
```
Response:
```json
{
  "message": "Approved compatibility adapter applied successfully",
  "incident": { "status": "REPAIR_APPLIED" }
}
```

#### `POST /api/incidents/:id/reject-fix`
Flags proposal for manual review without deploying adapter:
```json
{ "reason": "Requires upstream vendor ticket instead of client adapter" }
```

#### `POST /api/incidents/:id/rollback`
Reverts active adapter, returning service status to degraded.

---

### 4. Regression Validation & Live Proxy

#### `POST /api/incidents/:id/validate`
Executes automated 5-suite regression validation tests:
1. `API Response Structure`: Status code match
2. `Data Integrity`: Required fields present and data types verified
3. `Dependent Services`: Downstream consumers compatibility
4. `Frontend Functionality`: UI data bindings intact
5. `Performance Check`: Adapter latency overhead < 50ms
6. `Contract Compliance`: Zero remaining contract differences
```json
{
  "incident": { "status": "VALIDATED" },
  "validation": {
    "passed": true,
    "status": "PASSED",
    "ranAt": "2026-10-10T21:45:00.000Z",
    "summary": { "totalChecks": 6, "passedChecks": 6, "failedChecks": 0 },
    "checks": [ ... ],
    "normalizedResponse": {
      "statusCode": 200,
      "body": { "temp": 24, "condition": "Sunny", "humidity": 45, "city": "Indore" }
    }
  }
}
```

#### `GET /api/proxy/:serviceId`
Simulates live client or API Gateway traffic through the active compatibility adapter. Returns normalized payload ready for UI consumption.

#### `POST /api/demo/reset`
Resets all state, clears open incidents, removes active adapters, and restores healthy state for all services.

---

## 🔒 Safety and Persistence Notes
- All state is persisted to `data/state.json`.
- Automatic repair proposals are explainable and never auto-applied without `{ "approved": true }`.
- Ambiguous changes (e.g., semantic type shifts) are flagged for human review.
- Frontend files are strictly preserved and untouched.
