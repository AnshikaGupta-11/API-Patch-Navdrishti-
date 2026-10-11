# API Patch — Keep software working when APIs change

> **Hackathon MVP**: A robust, zero-downtime reliability proxy that autonomously detects undocumented upstream API breaking changes, calculates blast radius impact, proposes compatibility repair adapters with human-in-the-loop approval, executes regression validation, and serves normalized responses through an active proxy gateway.

---

## 1. Project Purpose & Architecture

In modern distributed microservice and AI agent architectures, upstream third-party APIs and SDKs silently change contracts (field renames, type shifts, rate limits, pagination shifts, semantic drift) without adequate notice. This breaks downstream frontends, background tasks, and AI integrations.

**API Patch** acts as an autonomous reliability proxy that sits between your applications and upstream providers:
1. **Continuous Monitor & Detector**: Detects breaking schema changes, HTTP status deviations, latency degradation, rate limits, and subtle semantic drift.
2. **Impact Analysis & Blast Radius Engine**: Traces contract changes through a dependency architecture graph to map affected downstream workflows, web pages, and background services.
3. **Safe Compatibility Repair Generator**: Generates deterministic compatibility adapters (AST/mapping diffs) with explicit human approval requirements.
4. **Automated Regression Suite**: Runs 5 verification suites (Response Structure, Data Integrity, Dependent Services, Frontend Functionality, Adapter Overhead) before activating adapters.
5. **Dynamic Proxy Gateway**: Normalizes live upstream responses back to the expected legacy baseline contract (`/api/proxy/:serviceId`).
6. **Official MCP Server (`@modelcontextprotocol/sdk`)**: Exposes 7 operational tools over Streamable HTTP for AI agents (Claude, Cursor, custom agents).
7. **Production Webhook Receiver & Simulator**: Validates payloads, verifies HMAC signatures, ensures idempotency, and feeds events directly into the incident pipeline.
8. **SDK Version Compatibility Engine**: Demonstrates client library breaking change handling (`user.name` vs `user.displayName`) and runtime adapter healing.

```
                      ┌──────────────────────────────────────┐
                      │    React / Vite Frontend (5173)      │
                      │   Navy & White Theme • Live Controls │
                      └──────────────────┬───────────────────┘
                                         │ REST Client
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       Express Backend Gateway (3001)                       │
├────────────────────┬────────────────────┬──────────────────────────────────┤
│ Detection Engine   │ Repair Engine      │ Model Context Protocol Server    │
│ • Status / 429     │ • Field Mapping    │ • @modelcontextprotocol/sdk      │
│ • Latency / Headers│ • Type Coercion    │ • Streamable HTTP (/mcp)         │
│ • Field Renames    │ • Semantic Drift   │ • 7 Registered Operational Tools │
│ • Pagination/Errors│ • Rollback / Reset │                                  │
├────────────────────┼────────────────────┼──────────────────────────────────┤
│ Webhook Receiver   │ SDK Compat Engine  │ Normalizing Gateway Proxy        │
│ • HMAC Verification│ • v1 / v2 Clients  │ • GET /api/proxy/:serviceId      │
│ • Idempotency      │ • Compat Adapter   │ • Restores baseline contract     │
│ • HTTP Simulator   │ • Workflow Runner  │ • Zero downstream downtime       │
└────────────────────┴────────────────────┴──────────────────────────────────┘
```

---

## 2. Workspace & Folder Structure

```
nav drashti project/
├── package.json                         # Unified workspace scripts (tests, build, dev)
├── README.md                            # Comprehensive MVP & judge demo documentation
│
├── api-guardian-backend/                # Node.js / Express Backend
│   ├── package.json                     # Express, cors, @modelcontextprotocol/sdk, zod
│   ├── src/
│   │   ├── server.js                    # Express app, REST routes, gateway proxy, error handler
│   │   ├── store.js                     # In-memory dependency registry, state persistence
│   │   ├── detector.js                  # Contract drift, 429, pagination, semantic detection
│   │   ├── impact.js                    # Downstream blast radius and workflow dependency graph
│   │   ├── repair.js                    # Repair proposals, adapter synthesis, 5-suite regression
│   │   ├── webhooks.js                  # Webhook receiver, HMAC verification, idempotency, simulator
│   │   ├── mcp-server.js                # Official MCP Server with Streamable HTTP transport
│   │   └── sdk-compat.js                # Simulated SDK v1 -> v2 breaking change & adapter
│   └── test/
│       ├── detector.test.js             # Contract detection unit tests
│       ├── repair.test.js               # Repair proposal and rollback tests
│       ├── server.test.js               # End-to-end full workflow API integration tests
│       ├── webhooks.test.js             # Webhook receiver, HMAC, idempotency tests
│       ├── mcp.test.js                  # MCP protocol handshake, tools discovery tests
│       ├── sdk-compat.test.js           # SDK v1/v2 breaking change and workflow tests
│       └── behavioural.test.js          # 429 rate limit, pagination, semantic drift tests
│
└── API_Patch_Navy_White_Theme (2)/
    └── API_Patch_Navy_White_Theme/      # React + Vite Frontend
        ├── package.json                 # React 18, Vite 5, TailwindCSS, Lucide, Recharts
        ├── vite.config.js               # Vite bundler configuration
        ├── tailwind.config.js           # Navy & White design token configuration
        ├── src/
        │   ├── api/
        │   │   └── client.js            # Centralized API client connecting to backend
        │   ├── context/
        │   │   └── AppContext.jsx       # State management, live backend sync, toasts, actions
        │   ├── pages/
        │   │   ├── DashboardPage.jsx    # Metrics, monitored APIs, sandbox strip, proxy card
        │   │   ├── ApisPage.jsx         # Inventory with dependency types and health statuses
        │   │   ├── ChangeDetectionPage.jsx # Side-by-side contract comparison and diffs
        │   │   ├── ImpactAnalysisPage.jsx  # Downstream blast radius and dependency tracing
        │   │   ├── SmartRepairPage.jsx  # Repair proposals, code diff, approval confirmation
        │   │   ├── ValidationRecoveryPage.jsx # 5 regression suites, proxy verification, rollback
        │   │   └── SettingsPage.jsx     # Alert preferences, polling interval, profile
        │   ├── components/layout/
        │   │   ├── Header.jsx           # Global search and top actions
        │   │   ├── Sidebar.jsx          # Primary navigation
        │   │   ├── Toast.jsx            # Dynamic toast alerts
        │   │   └── DemoToolbar.jsx      # Hackathon controls (Simulate, Heal, Webhook, SDK, Proxy, Reset)
        │   └── data/
        │       └── mockData.js          # Baseline mock schemas and test data structures
        └── test/
            └── frontend.test.mjs        # Frontend schema integrity and component tests
```

---

## 3. Installation, Startup & Environment

### Prerequisites
- **Node.js**: `>= 18.0.0` (Tested on Node.js v24.19.0)
- **npm**: `>= 9.0.0` (Tested on npm 11.17.0)

### Ports & Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Express backend listening port |
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL consumed by frontend client |
| `WEBHOOK_SECRET` | `api-guardian-secret-token` | Server-side HMAC SHA256 secret for webhook verification |

### Setup & Run Commands

#### Option A: Quick Start via Root Scripts
From the workspace root:
```bash
# 1. Run all 56 automated backend and frontend tests:
npm test

# 2. Start the Express Backend (Port 3001):
npm run start:backend

# 3. Start the React Frontend in a second terminal (Port 5173):
npm run start:frontend
```

#### Option B: Individual Service Commands
```bash
# Backend:
cd api-guardian-backend
npm install
npm test
npm start

# Frontend:
cd "API_Patch_Navy_White_Theme (2)/API_Patch_Navy_White_Theme"
npm install
npm test
npm run build
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend URL**: `http://localhost:3001`
- **MCP Endpoint**: `http://localhost:3001/mcp`
- **Proxy Gateway**: `http://localhost:3001/api/proxy/weather`

---

## 4. Test Verification Summary

| Test Suite | File | Tests | Status |
|---|---|---|---|
| Contract Drift Detection | `test/detector.test.js` | 7 tests | **PASS** |
| Repair Proposals & Rollback | `test/repair.test.js` | 4 tests | **PASS** |
| End-to-End Workflow | `test/server.test.js` | 4 tests | **PASS** |
| Real Webhook Receiver & HMAC | `test/webhooks.test.js` | 5 tests | **PASS** |
| Official MCP Server Handshake & Tools | `test/mcp.test.js` | 4 tests | **PASS** |
| SDK v1/v2 Incompatibility & Adapter | `test/sdk-compat.test.js` | 4 tests | **PASS** |
| Behavioral Changes (429, Pagination, Drift) | `test/behavioural.test.js` | 5 tests | **PASS** |
| **Backend Total** | `npm --prefix api-guardian-backend test` | **33 tests** | **100% PASS** |
| **Frontend Total** | `npm --prefix ... test` | **23 tests** | **100% PASS** |
| **Grand Total** | `npm test` | **56 tests** | **100% PASS** |

---

## 5. Official Model Context Protocol (MCP) Server

- **SDK Package**: `@modelcontextprotocol/sdk@1.32.1`
- **Server Implementation**: `api-guardian-backend/src/mcp-server.js`
- **Endpoint**: `/mcp`
- **Transport**: **Streamable HTTP** (official standard supporting bidirectional SSE streaming)
- **Informational Endpoints**:
  - `GET /api/mcp/info` &mdash; Server status, SDK version, and capability flags
  - `GET /api/mcp/tools` &mdash; Detailed tool registry and input schemas

### Registered MCP Tools
1. `list_dependencies` &mdash; Lists all monitored services, health states, uptime, and latency.
2. `inspect_dependency` &mdash; Inspects a service's baseline schema, observed response, and active adapter.
3. `run_dependency_monitor` &mdash; Triggers contract drift detection across all dependencies and creates incidents.
4. `simulate_dependency_change` &mdash; Simulates upstream contract breakages or latency degradation.
5. `get_incident_impact` &mdash; Computes downstream blast radius, affected workflows, and severity counts.
6. `propose_compatibility_fix` &mdash; Generates a safe compatibility repair proposal with code diff and mapping.
7. `validate_compatibility_fix` &mdash; Runs the 5-suite regression verification suite against normalized responses.

### Testing with an MCP Client or cURL
Initialize session over Streamable HTTP:
```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "judge-terminal", "version": "1.0.0" }
    }
  }'
```

---

## 6. Real Webhook Receiver & Simulator

- **Receiver Endpoint**: `POST /api/webhooks/receiver`
- **History Endpoint**: `GET /api/webhooks/history`
- **Simulator Endpoint**: `POST /api/webhooks/simulate`
- **HMAC Header**: `x-guardian-signature` (hex-encoded SHA256)

### Supported Event Types
- `dependency.changed` &mdash; Upstream payload altered; feeds directly into detector and generates an incident.
- `dependency.degraded` &mdash; Service latency increased (e.g. 580ms); flags degradation.
- `dependency.rate_limited` &mdash; HTTP 429 received; records rate limit incident with retry-after header.
- `dependency.recovered` &mdash; Upstream returned to healthy contract; automatically resolves degradation.

### Idempotency Protection
Every event requires an `eventId`. Duplicate events with the same `eventId` return status 200 with `{ "status": "duplicate", "duplicate": true }` to guarantee safe replay protection.

### Testing Webhooks via cURL
Dispatch a rate limit event to the real receiver:
```bash
curl -X POST http://localhost:3001/api/webhooks/receiver \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt-judge-001",
    "eventType": "dependency.rate_limited",
    "dependencyId": "github",
    "payload": { "retryAfter": 60 }
  }'
```
Or test via the HTTP simulator:
```bash
curl -X POST http://localhost:3001/api/webhooks/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "dependency.changed",
    "dependencyId": "weather"
  }'
```

---

## 7. SDK Version Compatibility Scenario

- **Implementation**: `api-guardian-backend/src/sdk-compat.js`
- **Scenario**: Upstream client SDK provider upgrades from `v1.0.0` to `v2.0.0`.
  - **SDK v1**: Exposes `user.name` &rarr; Downstream User Profile workflow succeeds.
  - **SDK v2**: Silently renames `user.name` to `user.displayName` &rarr; Downstream workflow throws `TypeError: Cannot read property 'name'`.
  - **UserClientCompatAdapter**: Intercepts the v2 client and provides dynamic fallback mapping (`name = displayName || name`) &rarr; Downstream workflow recovers without modifying application code.

### Endpoints
- `GET /api/sdk-scenario/status` &mdash; Current installed SDK version, active client, and adapter status
- `POST /api/sdk-scenario/simulate-upgrade` &mdash; Upgrades to v2 and runs workflow (demonstrates break)
- `POST /api/sdk-scenario/apply-adapter` &mdash; Applies compatibility adapter (requires `{ "approved": true }`)
- `POST /api/sdk-scenario/run-workflow` &mdash; Executes downstream consumer workflow
- `POST /api/sdk-scenario/reset` &mdash; Restores v1 baseline

---

## 8. Step-by-Step Judge Demonstration Script

Follow these 12 steps to demonstrate the complete API Guardian MVP to hackathon judges in under 3 minutes:

1. **Open the Dashboard (`http://localhost:5173`)**:
   - Point out the greeting banner with the green **"Express Backend Live (:3001)"** badge.
   - Point out the **"Multi-Dependency Sandbox Active"** strip showing support for REST, SDK, MCP, Webhooks, Rate-Limiting, and Semantic Drift.
   - Point out the 9 monitored dependencies with healthy uptime and response times.

2. **Simulate an Upstream Change**:
   - In the floating bottom demo pill, click **"Demo"** &rarr; click **"Simulate Incident"** (or in Change Detection page).
   - This fires `POST /api/services/weather/simulate-change` and `POST /api/monitor/run` on the backend.
   - An instant toast alerts: *"CRITICAL: Weather API schema mismatch detected by autonomous listener!"*

3. **Inspect the Change Detection Screen**:
   - Navigate to **Change Detection** in the sidebar.
   - View the side-by-side comparison:
     - Previous: `{ temp: 24, city: "Indore", ... }`
     - Current: `{ temperature: 24, city_name: "Indore", ... }`
   - Notice the detected changes: `temp -> temperature` and `city -> city_name` (Severity: HIGH).

4. **Inspect Impact Analysis & Blast Radius**:
   - Click **"View Details"** or navigate to **Impact Analysis**.
   - Review the blast radius calculation:
     - 6 total affected components (Frontend Pages: Weather Dashboard, City Search, Mobile App; Backend: Notification Service, Data Aggregator).
     - Breakdown by severity (High: 3, Medium: 3).

5. **Review the Smart Repair Proposal**:
   - Navigate to **Smart Repair**.
   - Review the AI repair proposal:
     - Mapping diff showing `- temp: data.temp` / `+ temperature: data.temperature`.
     - Synthesized compatibility adapter code with zero external dependencies.
     - Notice: Repair is NOT silently applied. It requires explicit human review and approval.

6. **Approve and Apply the Repair**:
   - Click **"Apply Fix"** &rarr; in the confirmation dialog, click **"Confirm & Apply"**.
   - Sends `POST /api/incidents/INC-001/apply-fix` with `{ "approved": true, "approvedBy": "Admin / Judge" }`.
   - The backend activates the runtime adapter in `store.state.adapters.weather`.

7. **Execute Regression Validation**:
   - The UI automatically transitions to **Validation & Recovery**.
   - All 5 regression test suites execute and pass:
     1. API Response Structure (HTTP 200 matches baseline)
     2. Data Integrity (`temp` and `city` restored and preserved)
     3. Dependent Services Compatibility
     4. Frontend Functionality
     5. Performance Check (< 50ms adapter overhead)

8. **Verify the Live Proxy Gateway (Step 11)**:
   - On the Validation & Recovery page, view the **"Live Gateway Proxy Verification"** card.
   - Downstream clients call `GET http://localhost:3001/api/proxy/weather`.
   - The gateway intercepts the upstream breaking response and returns:
     `{ "temp": 24, "city": "Indore", "condition": "Sunny", "humidity": 45 }`
   - Zero application code changes were required, and downstream callers experienced zero downtime.

9. **Test the Real Webhook Receiver**:
   - In the floating demo toolbar, click **"Webhook"**.
   - Demonstrates a real HTTP POST dispatched to `/api/webhooks/receiver` with payload and HMAC validation, feeding directly into the incident pipeline.

10. **Test the SDK Compatibility Scenario**:
    - In the floating demo toolbar, click **"SDK v1->v2"**.
    - Demonstrates consumer workflow breakage when `name` changes to `displayName`, and seamless recovery via the adapter.

11. **Test Safe Rollback**:
    - Click **"Rollback (if needed)"**.
    - Sends `POST /api/incidents/INC-001/rollback`.
    - Deactivates the adapter and restores pre-repair state.

12. **Reset the Sandbox (Repeatable)**:
    - In the demo toolbar, click **"Reset"**.
    - Fires `POST /api/demo/reset`, restoring clean baseline contracts for repeatable judging presentations.

---

## 9. Simulated vs. Genuinely Implemented Capabilities

| Capability | Implementation Reality | Notes |
|---|---|---|
| **Express Backend & REST Routes** | **100% Genuinely Implemented** | Real Express 4 server, live JSON endpoints, HTTP status codes, CORS. |
| **Model Context Protocol (MCP)** | **100% Genuinely Implemented** | Uses official `@modelcontextprotocol/sdk` with Streamable HTTP transport at `/mcp` and 7 working tools. |
| **Webhook Receiver & Idempotency** | **100% Genuinely Implemented** | Real POST endpoint, HMAC SHA256 verification, duplicate-event cache, live HTTP simulator. |
| **Compatibility Adapter & Proxy** | **100% Genuinely Implemented** | Dynamic adapter layer in `repair.js`; `/api/proxy/:serviceId` returns live normalized output. |
| **SDK Version Compatibility** | **100% Genuinely Implemented** | Real local client classes (`UserClientV1`, `UserClientV2`, `UserClientCompatAdapter`) and workflow runner. |
| **Third-Party Upstream Services** | **Deterministic Sandbox** | Simulated internally in `store.js` (Weather, Stripe, GitHub, Payments, Inventory) so the project runs reliably without paid API keys or external rate limits. |

---

## 10. Known Limitations

1. **In-Memory Storage**: The MVP stores registry state and incident history in Node.js memory (with JSON backup). State resets when the server is restarted or when `/api/demo/reset` is called.
2. **Deterministic Adaptation**: Automatic repair is provided for known structural transformations (renames, mappings, type coercion). Arbitrary code execution from unknown schemas is intentionally blocked for security, flagging ambiguous changes for human review.
3. **Local Network Transport**: The MCP server is mounted over Streamable HTTP on Express (`/mcp`), intended for local AI agent evaluation and internal tooling.
