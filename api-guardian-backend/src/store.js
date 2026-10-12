const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(__dirname, "..", "data");
const statePath = path.join(dataDir, "state.json");

function initialState() {
  const now = new Date().toISOString();

  const services = {
    weather: {
      id: "weather",
      name: "Weather API",
      type: "REST API",
      description: "Public weather endpoint providing temperature and conditions",
      endpoint: "https://api.weather.com/v1/current",
      status: "HEALTHY",
      changed: false,
      uptime: "97.4%",
      responseTimeMs: 240,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { temp: 24, condition: "Sunny", humidity: 45, city: "Indore" }
      },
      dependentWorkflows: ["Weather Dashboard", "Homepage", "Notification Service", "City Search", "Mobile App"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    users: {
      id: "users",
      name: "Users API",
      type: "SDK Adapter",
      description: "Internal User Identity client adapter (v1 name vs v2 displayName)",
      endpoint: "https://api.internal.org/v1/users/1",
      status: "HEALTHY",
      changed: false,
      uptime: "99.9%",
      responseTimeMs: 210,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { id: 1, name: "Rahul" }
      },
      dependentWorkflows: ["Profile Page", "Greeting Service", "Order History"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    products: {
      id: "products",
      name: "Products API",
      type: "REST API",
      description: "Catalog product details endpoint with strict pricing types",
      endpoint: "https://api.catalog.internal/v1/products/101",
      status: "HEALTHY",
      changed: false,
      uptime: "99.8%",
      responseTimeMs: 185,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { id: 101, title: "Notebook", price: 50 }
      },
      dependentWorkflows: ["Product Page", "Cart Total", "Checkout Service", "Search Results"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    payments: {
      id: "payments",
      name: "Payments API",
      type: "Semantic Status Service",
      description: "Payment processing state provider with immediate settlement semantics",
      endpoint: "https://api.checkout.internal/v1/payments/ORD-1",
      status: "HEALTHY",
      changed: false,
      uptime: "99.8%",
      responseTimeMs: 320,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { orderId: "ORD-1", status: "PAID", amount: 1500 }
      },
      dependentWorkflows: ["Order Status", "Payment Confirmation", "Immediate Checkout"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    github: {
      id: "github",
      name: "GitHub API",
      type: "Rate-Limited Service",
      description: "VCS API with rate limiting and version headers",
      endpoint: "https://api.github.com/v3",
      status: "HEALTHY",
      changed: false,
      uptime: "99.7%",
      responseTimeMs: 260,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        headers: { "x-ratelimit-limit": "5000", "x-ratelimit-remaining": "4990" },
        body: { status: "operational" }
      },
      dependentWorkflows: ["CI/CD Pipeline", "Release Sync", "Commit Monitor"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    stripe: {
      id: "stripe",
      name: "Stripe API",
      type: "Rate-Limited Service",
      description: "Payment gateway with latency monitoring and transaction charges",
      endpoint: "https://api.stripe.com/v1/charges",
      status: "HEALTHY",
      changed: false,
      uptime: "99.8%",
      responseTimeMs: 220,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        responseTimeMs: 220,
        body: { chargeId: "ch_123", paid: true }
      },
      dependentWorkflows: ["Checkout Flow", "Subscription Billing"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    openai: {
      id: "openai",
      name: "OpenAI API",
      type: "MCP / AI Service",
      description: "Model context provider & AI completions",
      endpoint: "https://api.openai.com/v1/models",
      status: "HEALTHY",
      changed: false,
      uptime: "99.9%",
      responseTimeMs: 210,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { object: "list", data: [] }
      },
      dependentWorkflows: ["AI Assistant", "Smart Code Generation"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    "inventory-mcp": {
      id: "inventory-mcp",
      name: "Inventory MCP Service",
      type: "MCP Server",
      description: "Local MCP Tool Provider for real-time inventory queries",
      endpoint: "mcp://inventory-service/tools/lookup_stock",
      status: "HEALTHY",
      changed: false,
      uptime: "99.9%",
      responseTimeMs: 140,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { sku: "SKU-9921", in_stock: 420, reserved_units: 15 }
      },
      dependentWorkflows: ["Warehouse Dispatch", "Inventory Sync", "Order Fulfillment"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    },
    "webhook-events": {
      id: "webhook-events",
      name: "Partner Webhook Source",
      type: "Webhook Event Source",
      description: "External partner webhook publisher emitting contract change notifications",
      endpoint: "https://events.partner-api.com/v1/stream",
      status: "HEALTHY",
      changed: false,
      uptime: "99.9%",
      responseTimeMs: 95,
      lastObservedAt: now,
      current: {
        statusCode: 200,
        body: { streamStatus: "active", ingestedEventsCount: 1480 }
      },
      dependentWorkflows: ["Order Event Ingestion", "Partner Notification Pipeline"],
      remediationStatus: "HEALTHY",
      changeHistory: []
    }
  };

  const baselines = {
    weather: {
      statusCode: 200,
      body: { temp: 24, condition: "Sunny", humidity: 45, city: "Indore" },
      requiredFields: ["temp", "condition", "humidity", "city"]
    },
    users: {
      statusCode: 200,
      body: { id: 1, name: "Rahul" },
      requiredFields: ["id", "name"]
    },
    products: {
      statusCode: 200,
      body: { id: 101, title: "Notebook", price: 50 },
      requiredFields: ["id", "title", "price"]
    },
    payments: {
      statusCode: 200,
      body: { orderId: "ORD-1", status: "PAID", amount: 1500 },
      requiredFields: ["orderId", "status"]
    },
    github: {
      statusCode: 200,
      headers: { "x-ratelimit-limit": "5000", "x-ratelimit-remaining": "4990" },
      body: { status: "operational" },
      requiredFields: ["status"]
    },
    stripe: {
      statusCode: 200,
      responseTimeMs: 220,
      body: { chargeId: "ch_123", paid: true },
      requiredFields: ["chargeId", "paid"]
    },
    openai: {
      statusCode: 200,
      body: { object: "list", data: [] },
      requiredFields: ["object"]
    },
    "inventory-mcp": {
      statusCode: 200,
      body: { sku: "SKU-9921", in_stock: 420, reserved_units: 15 },
      requiredFields: ["sku", "in_stock"]
    },
    "webhook-events": {
      statusCode: 200,
      body: { streamStatus: "active", ingestedEventsCount: 1480 },
      requiredFields: ["streamStatus"]
    }
  };

  const dependencies = {
    "weather.temp": {
      workflows: ["Weather Dashboard", "Homepage", "Notification Service"],
      endpoints: [
        {
          endpoint: "GET /weather/current",
          service: "Frontend",
          impact: "High",
          description: "Missing field: temp -> temperature"
        },
        {
          endpoint: "GET /notifications",
          service: "Backend",
          impact: "Medium",
          description: "Weather notification alerts"
        }
      ]
    },
    "weather.city": {
      workflows: ["City Search", "Weather Dashboard", "Mobile App"],
      endpoints: [
        {
          endpoint: "POST /weather/search",
          service: "Frontend",
          impact: "Medium",
          description: "Response format changed for city search"
        },
        {
          endpoint: "GET /mobile/sync",
          service: "External",
          impact: "High",
          description: "Mobile App location data binding"
        }
      ]
    },
    "weather.condition": {
      workflows: ["Weather Dashboard", "Data Aggregator"],
      endpoints: [
        {
          endpoint: "GET /aggregator/feed",
          service: "Backend",
          impact: "Medium",
          description: "Data mapping required"
        }
      ]
    },
    "weather.humidity": {
      workflows: ["Weather Dashboard"],
      endpoints: [
        {
          endpoint: "GET /user/preferences",
          service: "Backend",
          impact: "Low",
          description: "Optional climate preference display"
        }
      ]
    },
    "users.name": {
      workflows: ["Profile Page", "Greeting Service"],
      endpoints: [
        {
          endpoint: "GET /v1/users/1",
          service: "SDK Adapter",
          impact: "High",
          description: "Missing name property on User entity"
        }
      ]
    },
    "users.id": ["Profile Page", "Order History"],
    "products.price": ["Product Page", "Cart Total", "Checkout Service"],
    "products.title": ["Product Page", "Search Results"],
    "payments.status": ["Order Status", "Payment Confirmation", "Immediate Checkout"],
    "inventory-mcp.sku": {
      workflows: ["Warehouse Dispatch", "Inventory Sync", "Order Fulfillment"],
      endpoints: [
        {
          endpoint: "mcp://inventory-service/tools/lookup_stock",
          service: "MCP Server",
          impact: "High",
          description: "Tool contract broken: SKU parameter missing"
        }
      ]
    },
    "webhook-events.streamStatus": {
      workflows: ["Order Event Ingestion", "Partner Notification Pipeline"],
      endpoints: [
        {
          endpoint: "POST /api/webhooks/receiver",
          service: "Backend",
          impact: "High",
          description: "Partner webhook listener degradation"
        }
      ]
    }
  };

  const recentActivity = [
    {
      id: "act-1",
      serviceId: "stripe",
      serviceName: "Stripe API",
      type: "NORMAL",
      badge: "normal",
      message: "Stripe API - back to normal (Resolved automatically)",
      timeAgo: "1 hour ago",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "act-2",
      serviceId: "openai",
      serviceName: "OpenAI API",
      type: "HEALTHY",
      badge: "healthy",
      message: "OpenAI API - healthy (No issues)",
      timeAgo: "2 hours ago",
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return {
    services,
    baselines,
    dependencies,
    adapters: {},
    incidents: [],
    recentActivity,
    nextIncidentNumber: 1,
    processedWebhookIds: [],
    webhookEvents: [],
    sdkScenario: {
      version: "v1",
      activeClient: "UserClientV1",
      installedSdk: "1.2.0",
      adapterActive: false,
      history: []
    }
  };
}

class Store {
  constructor() {
    fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(statePath)) {
      try {
        this.state = JSON.parse(fs.readFileSync(statePath, "utf8"));
        // Ensure core structure integrity
        if (!this.state.services || !this.state.baselines) {
          this.state = initialState();
          this.save();
        }
      } catch {
        this.state = initialState();
        this.save();
      }
    } else {
      this.state = initialState();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(statePath, JSON.stringify(this.state, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save state to disk:", err);
    }
  }

  findIncident(id) {
    return this.state.incidents.find((incident) => incident.id === id);
  }

  logActivity(entry) {
    const activityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      timeAgo: "Just now",
      ...entry
    };
    if (!this.state.recentActivity) this.state.recentActivity = [];
    this.state.recentActivity.unshift(activityItem);
    if (this.state.recentActivity.length > 25) {
      this.state.recentActivity = this.state.recentActivity.slice(0, 25);
    }
  }

  simulateChange(serviceId, customPayload = null) {
    const service = this.state.services[serviceId];
    if (!service) return { ok: false, error: "Unknown service" };

    if (customPayload) {
      service.current = customPayload;
    } else if (serviceId === "weather") {
      service.current = {
        statusCode: 200,
        body: {
          temperature: 24,
          condition: "Sunny",
          humidity: 45,
          city_name: "Indore"
        }
      };
      this.logActivity({
        serviceId: "weather",
        serviceName: "Weather API",
        type: "CHANGED",
        badge: "changed",
        message: "Weather API response changed (2 fields modified: temp -> temperature, city -> city_name)"
      });
    } else if (serviceId === "users") {
      service.current = {
        statusCode: 200,
        body: { id: 1, display_name: "Rahul" }
      };
      this.logActivity({
        serviceId: "users",
        serviceName: "Users API",
        type: "CHANGED",
        badge: "changed",
        message: "Users API response changed (name renamed to display_name)"
      });
    } else if (serviceId === "products") {
      service.current = {
        statusCode: 200,
        body: { id: 101, title: "Notebook", price: "50" }
      };
      this.logActivity({
        serviceId: "products",
        serviceName: "Products API",
        type: "CHANGED",
        badge: "changed",
        message: 'Products API type changed (price number to string "50")'
      });
    } else if (serviceId === "payments") {
      service.current = {
        statusCode: 200,
        body: { orderId: "ORD-1", status: "PROCESSING", amount: 1500 }
      };
      this.logActivity({
        serviceId: "payments",
        serviceName: "Payments API",
        type: "CHANGED",
        badge: "changed",
        message: "Payments API status changed to PROCESSING"
      });
    } else if (serviceId === "github") {
      service.current = {
        statusCode: 200,
        headers: {
          "x-ratelimit-limit": "5000",
          "x-ratelimit-remaining": "4990",
          "x-github-api-version": "2026-10-10"
        },
        body: { status: "operational" }
      };
      this.logActivity({
        serviceId: "github",
        serviceName: "GitHub API",
        type: "MINOR",
        badge: "minor",
        message: "GitHub API - minor change detected (Header added: x-github-api-version)"
      });
    } else if (serviceId === "stripe") {
      service.current = {
        statusCode: 200,
        responseTimeMs: 480,
        body: { chargeId: "ch_123", paid: true }
      };
      service.responseTimeMs = 480;
      this.logActivity({
        serviceId: "stripe",
        serviceName: "Stripe API",
        type: "PERFORMANCE",
        badge: "performance",
        message: "Stripe API response time increased (220ms -> 480ms)"
      });
    } else if (serviceId === "inventory-mcp") {
      service.current = {
        statusCode: 200,
        body: { item_code: "SKU-9921", in_stock: 420, reserved_units: 15 }
      };
      this.logActivity({
        serviceId: "inventory-mcp",
        serviceName: "Inventory MCP Service",
        type: "CHANGED",
        badge: "changed",
        message: "Inventory MCP tool response contract changed: parameter 'sku' renamed to 'item_code'"
      });
    } else if (serviceId === "webhook-events") {
      service.current = {
        statusCode: 503,
        body: { streamStatus: "disconnected", error: "Partner upstream webhook transport unreachable" }
      };
      service.status = "DEGRADED";
      this.logActivity({
        serviceId: "webhook-events",
        serviceName: "Partner Webhook Source",
        type: "CHANGED",
        badge: "changed",
        message: "Partner Webhook Source stream status changed to disconnected (HTTP 503)"
      });
    }

    service.changed = true;
    service.status = "CHANGE_SIMULATED";
    service.lastObservedAt = new Date().toISOString();
    this.save();
    return { ok: true, data: { serviceId, current: service.current } };
  }

  reset() {
    this.state = initialState();
    this.save();
  }
}

const store = new Store();
module.exports = { store, initialState };
