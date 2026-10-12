# The Internet After the API — Autonomous API Reliability Engine

A complete, high-fidelity developer SaaS frontend built for the **"The Internet After the API"** hackathon project.

Designed and implemented in **React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts**, replicating the exact visual identity, layout proportions, compact metrics, and SaaS aesthetic of the reference dashboard design.

---

## 🎨 Visual Identity & Color Palette

Recreated directly from the reference interface specifications:

| Token | Hex | Role |
|---|---|---|
| **Outer Background** | `#050D1B` | Deep navy outer canvas |
| **Sidebar Background** | `#0B172A` | Left persistent navigation bar |
| **Active Nav Item** | `#1D3B70` | Active route selection pill |
| **Main Content Canvas** | `#F7F9FD` | Crisp light blue-grey content area |
| **Cards & Panels** | `#FFFFFF` | Rounded cards with subtle border `#E2E8F0` |
| **Primary Blue** | `#405CFF` | Primary action buttons & active indicators |
| **Accent Violet** | `#6555FF` | AI analysis badges & smart repair tags |
| **Main Text** | `#111827` | Headings, primary metrics, values |
| **Secondary Text** | `#64748B` | Subtitles, labels, descriptions |
| **Success Green** | `#10B981` | Healthy status, test passed indicators |
| **Warning Orange** | `#F59E0B` | Medium impact, schema warnings |
| **Error Red** | `#EF4444` | Breaking change alerts, high severity |

---

## 🚀 All 7 Pages Implemented

### 1. Dashboard (`/`)
- **Operator Greeting**: *"Good Morning, Chinmay 👋"* with real-time timestamp.
- **4 Key Metric Cards**:
  - `Total APIs`: **12** (`+1 since last 24h`, green box icon)
  - `APIs with Changes`: **2** (`Requires attention`, red warning triangle)
  - `Healthy APIs`: **10** (`83.3% uptime`, blue checkmark)
  - `Avg. Response Time`: **248 ms** (`-12% improvement`, orange timer)
- **Monitored APIs Table**: Live status, uptime, latency, and last checked timestamps with inline inspection.
- **Recent Activity Feed**: Real-time event log with color-coded status badges and relative timestamps.
- **Telemetry Charts**: 24-hour latency curve (Recharts AreaChart) and Status Distribution Donut.

### 2. Monitored APIs (`/apis`)
- **Full Endpoint Directory**: Comprehensive table with method badges, status pills, latency, uptime, and environment tags.
- **Live Search & Multi-Filter**: Filter dynamically by keyword, status (Healthy / Changed / Warning), and environment (Production / Staging / Development).
- **"+ Add API" Modal**: Functional registration dialog with validation for new endpoints, polling frequency, and service categories.
- **API Inspector Drawer / Modal**: Inspect request headers, latest response JSON, and trigger manual health probes with live toasts.

### 3. Change Detection (`/change-detection`)
- **Featured Breaking Change Banner**: Weather API (`https://api.weather.com/v1/current`) with `Breaking Change Detected` badge.
- **Side-by-Side JSON Diff**:
  - *Previous Response* (`temp: 24`, `city: "Indore"`)
  - *Current Response* (`temperature: 24`, `city_name: "Indore"`)
- **Changes Detected Alert Box**: Highlights renamed and removed fields with clear severity tags.
- **Other Detected Changes**: Cards for GitHub API (header added), Stripe API (latency jump), and Payment Gateway.

### 4. Impact Analysis (`/impact-analysis`)
- **Affected Services & Pages Card**:
  - Prominent badge: **6 Total Affected**
  - Category breakdown: Frontend Pages (3), Backend Services (2), External Integrations (1).
- **Impact Severity Breakdown**: High (3), Medium (2), Low (1) with color-coded proportional bars.
- **Interactive Visual Dependency Graph**: Traces origin event → Ingress Gateway → Downstream consumers.
- **Affected Endpoints Table & Drawer**: Click any endpoint (`GET /weather/current`, `POST /weather/search`, etc.) to view stack traces and impacted source files.

### 5. Smart Repair (`/smart-repair`)
- **AI Analysis Badge**: Violet indicator showing autonomous analysis completion.
- **Before-and-After Code Diff**: Visual AST diff highlighting removals in red and additions in green:
  ```javascript
  {
  -   temp: data.temp,
  -   city: data.city
  +   temperature: data.temperature ?? data.temp,
  +   city_name: data.city_name ?? data.city
  }
  ```
- **Interactive Actions**:
  - `Copy Fix`: Copies backward-compatible adapter snippet to clipboard with toast notification.
  - `Apply Automatically`: Simulates automated codebase patching with confirmation modal, updates global state, and navigates to validation.
  - `Manual Review`: Opens detailed code review modal with AST inspection and zero-downtime audit logs.

### 6. Validation & Recovery (`/validation-recovery`)
- **Validation Tests Suite**:
  - `API Response Structure`: Passed
  - `Data Integrity`: Passed
  - `Dependent Services`: Passed
  - `Frontend Functionality`: Passed
  - `Performance Check`: Passed
- **Interactive "Re-run Tests"**: Triggers live test execution simulation with changing statuses.
- **Issue Resolved Card**: Confirmation banner with:
  - `View Logs`: Opens modal with full test execution stream, timestamps, assertions, and curl outputs.
  - `Rollback (if needed)`: Functional rollback dialog that safely restores pre-repair state.

### 7. Settings (`/settings`)
- **Operator Profile**: Customize user name, email, role, and API security token.
- **Theme Identity**: Preview and inspect the primary Navy & White design tokens.
- **Notification Preferences**: Interactive toggles for Email alerts, Slack webhooks, and strict breaking change thresholds.
- **Monitoring Configuration**: Configurable polling intervals (30s, 60s, 5m) and SLA latency degradation limits.

---

## 💻 How to Run the Application

### Option A: Development Server (Recommended)
From the project directory:
```bash
npm run dev
```
Open your browser at:
```
http://localhost:3000
```

### Option B: Production Preview
```bash
npm run build
npm run preview
```

### Option C: Direct File Access
The distribution in `dist/` and `API_Patch_Frontend/` contains relative path assets, allowing it to be opened directly or served from any web server.

---

## 🛠️ Tech Stack
- **React 18** (Modern functional components, hooks, Context API)
- **Vite 5** (Ultra-fast build tool and HMR dev server)
- **Tailwind CSS 3** (Custom design system extensions matching the reference image)
- **Lucide React** (Consistent, pixel-perfect icon set)
- **Recharts** (Interactive telemetry area charts and status donut visualizations)
