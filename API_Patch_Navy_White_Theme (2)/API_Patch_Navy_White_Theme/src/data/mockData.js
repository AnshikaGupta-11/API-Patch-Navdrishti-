export const initialApis = [
  {
    id: 'api-0',
    name: 'User API',
    endpoint: 'https://api.internal.corp/v1/users',
    path: '/v1/users',
    status: 'Changed',
    uptime: '99.1%',
    responseTime: '310 ms',
    latencyNum: 310,
    lastChecked: '4 mins ago',
    env: 'Production',
    method: 'GET',
    version: 'v1',
    category: 'Identity & Accounts',
    reliability: 99.1,
    hasBreakingChange: true,
    headers: { 'Accept': 'application/json', 'Authorization': 'Bearer usr_token_***' },
    sampleResponse: {
      id: 101,
      display_name: 'Rahul',
      email: 'rahul@example.com'
    }
  },
  {
    id: 'api-1',
    name: 'OpenAI API',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    path: '/v1/chat/completions',
    status: 'Healthy',
    uptime: '99.9%',
    responseTime: '210 ms',
    latencyNum: 210,
    lastChecked: '2 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'AI Services',
    reliability: 99.9,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-***' },
    sampleResponse: {
      id: 'chatcmpl-98124',
      object: 'chat.completion',
      created: 1728564200,
      model: 'gpt-4o',
      choices: [{ message: { role: 'assistant', content: 'Ready.' } }]
    }
  },
  {
    id: 'api-2',
    name: 'Stripe API',
    endpoint: 'https://api.stripe.com/v1/payment_intents',
    path: '/v1/payment_intents',
    status: 'Healthy',
    uptime: '99.8%',
    responseTime: '320 ms',
    latencyNum: 320,
    lastChecked: '3 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'Billing',
    reliability: 99.8,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2024-06-20' },
    sampleResponse: {
      id: 'pi_3PjX82Lkj9',
      status: 'succeeded',
      amount: 4900,
      currency: 'usd'
    }
  },
  {
    id: 'api-3',
    name: 'Weather API',
    endpoint: 'https://api.weather.com/v1/current',
    path: '/v1/current',
    status: 'Changed',
    uptime: '97.4%',
    responseTime: '480 ms',
    latencyNum: 480,
    lastChecked: '5 mins ago',
    env: 'Production',
    method: 'GET',
    version: 'v1',
    category: 'Weather & Geolocation',
    reliability: 97.4,
    hasBreakingChange: true,
    headers: { 'Accept': 'application/json', 'x-api-key': 'wx_live_***' },
    sampleResponse: {
      temperature: 24,
      condition: 'Sunny',
      humidity: 45,
      city_name: 'Indore'
    }
  },
  {
    id: 'api-4',
    name: 'GitHub API',
    endpoint: 'https://api.github.com/v1/repos',
    path: '/v1/repos',
    status: 'Healthy',
    uptime: '99.7%',
    responseTime: '260 ms',
    latencyNum: 260,
    lastChecked: '6 mins ago',
    env: 'Production',
    method: 'GET',
    version: 'v3',
    category: 'Developer Tools',
    reliability: 99.7,
    headers: { 'Accept': 'application/vnd.github.v3+json' },
    sampleResponse: {
      id: 8493021,
      name: 'core-gateway',
      private: true,
      open_issues: 3
    }
  },
  {
    id: 'api-5',
    name: 'News API',
    endpoint: 'https://newsapi.org/v2/top-headlines',
    path: '/v2/top-headlines',
    status: 'Healthy',
    uptime: '99.6%',
    responseTime: '310 ms',
    latencyNum: 310,
    lastChecked: '8 mins ago',
    env: 'Production',
    method: 'GET',
    version: 'v2',
    category: 'Content',
    reliability: 99.6,
    headers: { 'X-Api-Key': 'news_live_***' },
    sampleResponse: {
      status: 'ok',
      totalResults: 38,
      articles: [{ title: 'Tech breaking changes report 2026' }]
    }
  },
  {
    id: 'api-6',
    name: 'Twilio SMS API',
    endpoint: 'https://api.twilio.com/2010-04-01/Accounts',
    path: '/2010-04-01/Accounts',
    status: 'Healthy',
    uptime: '99.9%',
    responseTime: '195 ms',
    latencyNum: 195,
    lastChecked: '14 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'Communication',
    reliability: 99.9,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  },
  {
    id: 'api-7',
    name: 'Auth0 Service',
    endpoint: 'https://auth.internal.corp/oauth/v2/token',
    path: '/oauth/v2/token',
    status: 'Healthy',
    uptime: '99.95%',
    responseTime: '145 ms',
    latencyNum: 145,
    lastChecked: '18 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v2',
    category: 'Identity',
    reliability: 99.95,
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'api-8',
    name: 'AWS S3 Storage',
    endpoint: 'https://s3.amazonaws.com/api-cache',
    path: '/api-cache',
    status: 'Healthy',
    uptime: '100%',
    responseTime: '120 ms',
    latencyNum: 120,
    lastChecked: '22 mins ago',
    env: 'Production',
    method: 'GET',
    version: 'v1',
    category: 'Infrastructure',
    reliability: 100,
    headers: { 'x-amz-date': '20261010T120000Z' }
  },
  {
    id: 'api-9',
    name: 'SendGrid Mailer',
    endpoint: 'https://api.sendgrid.com/v3/mail/send',
    path: '/v3/mail/send',
    status: 'Healthy',
    uptime: '99.8%',
    responseTime: '230 ms',
    latencyNum: 230,
    lastChecked: '30 mins ago',
    env: 'Staging',
    method: 'POST',
    version: 'v3',
    category: 'Communication',
    reliability: 99.8,
    headers: { 'Authorization': 'Bearer SG.***' }
  },
  {
    id: 'api-10',
    name: 'Datadog Metrics',
    endpoint: 'https://api.datadoghq.com/api/v1/series',
    path: '/api/v1/series',
    status: 'Healthy',
    uptime: '99.9%',
    responseTime: '185 ms',
    latencyNum: 185,
    lastChecked: '45 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'Observability',
    reliability: 99.9,
    headers: { 'DD-API-KEY': 'dd_live_***' }
  },
  {
    id: 'api-11',
    name: 'Segment Analytics',
    endpoint: 'https://api.segment.io/v1/track',
    path: '/v1/track',
    status: 'Healthy',
    uptime: '99.9%',
    responseTime: '160 ms',
    latencyNum: 160,
    lastChecked: '50 mins ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'Analytics',
    reliability: 99.9,
    headers: { 'Content-Type': 'application/json' }
  },
  {
    id: 'api-12',
    name: 'Slack Notifications',
    endpoint: 'https://hooks.slack.com/services/T00/B00',
    path: '/services/T00/B00',
    status: 'Healthy',
    uptime: '99.9%',
    responseTime: '175 ms',
    latencyNum: 175,
    lastChecked: '1 hour ago',
    env: 'Production',
    method: 'POST',
    version: 'v1',
    category: 'Communication',
    reliability: 99.9,
    headers: { 'Content-Type': 'application/json' }
  }
];

export const initialRecentActivity = [
  {
    id: 'act-1',
    apiName: 'Weather API',
    action: 'response changed',
    timeAgo: '5 mins ago',
    detail: '2 fields modified',
    statusColor: 'red',
    dotColor: '#EF4444',
    type: 'changed'
  },
  {
    id: 'act-2',
    apiName: 'GitHub API',
    action: 'minor change detected',
    timeAgo: '12 mins ago',
    detail: 'Header update',
    statusColor: 'orange',
    dotColor: '#F59E0B',
    type: 'warning'
  },
  {
    id: 'act-3',
    apiName: 'Stripe API',
    action: 'back to normal',
    timeAgo: '1 hour ago',
    detail: 'Resolved automatically',
    statusColor: 'green',
    dotColor: '#10B981',
    type: 'resolved'
  },
  {
    id: 'act-4',
    apiName: 'OpenAI API',
    action: '- healthy',
    timeAgo: '2 hours ago',
    detail: 'No issues',
    statusColor: 'blue',
    dotColor: '#3B82F6',
    type: 'healthy'
  }
];

export const changeDetectionData = {
  featured: {
    apiName: 'Weather API',
    endpoint: 'https://api.weather.com/v1/current',
    alertTitle: 'Breaking Change Detected',
    timestamp: new Date().toISOString(),
    previousResponse: {
      temp: 24,
      condition: "Sunny",
      humidity: 45,
      city: "Indore"
    },
    currentResponse: {
      temperature: 24,
      condition: "Sunny",
      humidity: 45,
      city_name: "Indore"
    },
    changesDetected: [
      {
        field: 'temp',
        newField: 'temperature',
        type: 'renamed',
        description: "Field 'temp' renamed to 'temperature'",
        severity: 'breaking'
      },
      {
        field: 'city',
        newField: 'city_name',
        type: 'renamed',
        description: "Field 'city' renamed to 'city_name'",
        severity: 'breaking'
      }
    ]
  },
  otherChanges: [
    {
      id: 'other-0',
      apiName: 'User API',
      changeSummary: 'Semantic change: field "name" missing, "display_name" appeared',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      tag: 'Breaking',
      tagType: 'breaking',
      tagColor: 'bg-red-50 text-red-600 border border-red-200',
      icon: 'user'
    },
    {
      id: 'other-1',
      apiName: 'GitHub API',
      changeSummary: 'Header added: x-github-api-version',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      tag: 'Minor',
      tagType: 'minor',
      tagColor: 'bg-blue-50 text-blue-600 border border-blue-200',
      icon: 'github'
    },
    {
      id: 'other-2',
      apiName: 'Stripe API',
      changeSummary: 'Response time increased (220ms → 480ms)',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      tag: 'Performance',
      tagType: 'performance',
      tagColor: 'bg-amber-50 text-amber-600 border border-amber-200',
      icon: 'credit-card'
    },
    {
      id: 'other-3',
      apiName: 'Payment API',
      changeSummary: 'Field middle_name marked deprecated in customer schema',
      timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      tag: 'Schema',
      tagType: 'schema',
      tagColor: 'bg-purple-50 text-purple-600 border border-purple-200',
      icon: 'code'
    }
  ]
};

export const apiChangeMap = {
  'User API': {
    apiName: 'User API',
    endpoint: 'https://api.internal.corp/v1/users',
    alertTitle: 'Semantic Field Shift Detected',
    alertType: 'breaking',
    timestamp: new Date().toISOString(),
    previousResponse: {
      id: 101,
      name: 'Rahul',
      email: 'rahul@example.com'
    },
    currentResponse: {
      id: 101,
      display_name: 'Rahul',
      email: 'rahul@example.com'
    },
    changesDetected: [
      { field: 'name', newField: 'display_name', type: 'renamed', description: 'Field "name" is missing. New field "display_name" appeared.', severity: 'breaking' }
    ]
  },
  'Weather API': {
    apiName: 'Weather API',
    endpoint: 'https://api.weather.com/v1/current',
    alertTitle: 'Breaking Change Detected',
    alertType: 'breaking',
    timestamp: new Date().toISOString(),
    previousResponse: {
      temp: 24,
      condition: "Sunny",
      humidity: 45,
      city: "Indore"
    },
    currentResponse: {
      temperature: 24,
      condition: "Sunny",
      humidity: 45,
      city_name: "Indore"
    },
    changesDetected: [
      { field: 'temp', newField: 'temperature', type: 'renamed', description: "Field 'temp' renamed to 'temperature'", severity: 'breaking' },
      { field: 'city', newField: 'city_name', type: 'renamed', description: "Field 'city' renamed to 'city_name'", severity: 'breaking' }
    ]
  },
  'GitHub API': {
    apiName: 'GitHub API',
    endpoint: 'https://api.github.com/v1/repos',
    alertTitle: 'Minor Change Detected',
    alertType: 'minor',
    timestamp: 'Oct 10, 2025 - 08:42 AM',
    previousResponse: {
      id: 8493021,
      name: "core-gateway",
      private: true,
      open_issues: 3
    },
    currentResponse: {
      id: 8493021,
      name: "core-gateway",
      private: true,
      open_issues: 3,
      "x-github-api-version": "2024-04-01"
    },
    changesDetected: [
      { field: 'x-github-api-version', type: 'added', description: "Header & payload metadata added: x-github-api-version", severity: 'minor' }
    ]
  },
  'Stripe API': {
    apiName: 'Stripe API',
    endpoint: 'https://api.stripe.com/v1/payment_intents',
    alertTitle: 'Latency SLA Degraded (480ms)',
    alertType: 'warning',
    timestamp: 'Oct 10, 2025 - 07:15 AM',
    previousResponse: {
      id: "pi_3PjX82",
      status: "succeeded",
      amount: 4900,
      latency_ms: 220
    },
    currentResponse: {
      id: "pi_3PjX82",
      status: "succeeded",
      amount: 4900,
      latency_ms: 480
    },
    changesDetected: [
      { field: 'latency_ms', type: 'performance', description: "Round-trip response latency jumped from 220ms to 480ms (>300ms SLA)", severity: 'warning' }
    ]
  },
  'Payment API': {
    apiName: 'Payment API',
    endpoint: 'https://api.payment.internal/v1/customers',
    alertTitle: 'Field Deprecation Detected',
    alertType: 'minor',
    timestamp: 'Oct 10, 2025 - 06:30 AM',
    previousResponse: {
      customer_id: "cus_9281",
      first_name: "Alex",
      middle_name: "R",
      last_name: "Bulani"
    },
    currentResponse: {
      customer_id: "cus_9281",
      first_name: "Alex",
      last_name: "Bulani"
    },
    changesDetected: [
      { field: 'middle_name', type: 'removed', description: "Field 'middle_name' was removed from response payload", severity: 'warning' }
    ]
  },
  'Payments API': {
    apiName: 'Payments API',
    endpoint: 'https://api.payments.corp/v2/transactions',
    alertTitle: 'Semantic Status Shift (PAID → PROCESSING)',
    alertType: 'breaking',
    timestamp: new Date().toISOString(),
    previousResponse: {
      transactionId: "tx_90123",
      status: "PAID",
      amount: 1500,
      settledAt: "2026-10-12T00:00:00Z"
    },
    currentResponse: {
      transactionId: "tx_90123",
      status: "PROCESSING",
      amount: 1500,
      settledAt: null
    },
    changesDetected: [
      { field: 'status', type: 'semantic_drift', description: "Field 'status' changed from 'PAID' to asynchronous 'PROCESSING'", severity: 'breaking' }
    ]
  },
  'Products API': {
    apiName: 'Products API',
    endpoint: 'https://api.catalog.corp/v1/products',
    alertTitle: 'Data Type Shift Detected (price: number → string)',
    alertType: 'breaking',
    timestamp: new Date().toISOString(),
    previousResponse: {
      id: "prod_402",
      name: "Cloud Gateway Router",
      price: 50,
      inStock: true
    },
    currentResponse: {
      id: "prod_402",
      name: "Cloud Gateway Router",
      price: "50",
      inStock: true
    },
    changesDetected: [
      { field: 'price', type: 'type_change', description: "Field 'price' changed from number (50) to string (\"50\")", severity: 'breaking' }
    ]
  },
  'Inventory MCP Service': {
    apiName: 'Inventory MCP Service',
    endpoint: 'mcp://inventory-service/tools/check_stock',
    alertTitle: 'Parameter Renamed (sku → item_code)',
    alertType: 'breaking',
    timestamp: new Date().toISOString(),
    previousResponse: {
      sku: "SKU-9901",
      quantity: 120,
      warehouse: "Central-1"
    },
    currentResponse: {
      item_code: "SKU-9901",
      quantity: 120,
      warehouse: "Central-1"
    },
    changesDetected: [
      { field: 'sku', newField: 'item_code', type: 'renamed', description: "Parameter 'sku' was replaced with 'item_code'", severity: 'breaking' }
    ]
  }
};

export const impactAnalysisData = {
  selectedApi: 'Weather API (Latest Change)',
  totalAffected: 6,
  breakdown: [
    {
      category: 'Frontend Pages',
      count: 3,
      examples: 'e.g. Weather Dashboard, City Search, Homepage',
      icon: 'layout',
      accentColor: '#3B82F6'
    },
    {
      category: 'Backend Services',
      count: 2,
      examples: 'e.g. Notification Service, Data Aggregator',
      icon: 'server',
      accentColor: '#6555FF'
    },
    {
      category: 'External Integrations',
      count: 1,
      examples: 'e.g. Mobile App, Third Party Tools',
      icon: 'share-2',
      accentColor: '#F59E0B'
    }
  ],
  severity: {
    high: { count: 3, percentage: 50, color: '#EF4444' },
    medium: { count: 2, percentage: 33, color: '#F59E0B' },
    low: { count: 1, percentage: 17, color: '#10B981' }
  },
  affectedEndpoints: [
    {
      id: 'ep-1',
      endpoint: 'GET /weather/current',
      service: 'Frontend',
      impact: 'High',
      impactClass: 'bg-red-50 text-red-600 border border-red-200',
      description: 'Missing field: temp → temperature',
      component: 'WeatherCard.jsx, CurrentTempWidget.jsx',
      details: 'Component relies on res.temp. Rendering undefined produces blank temperature card for users.',
      lineNum: 'WeatherCard.jsx:42',
      isConfirmed: true
    },
    {
      id: 'ep-2',
      endpoint: 'POST /weather/search',
      service: 'Frontend',
      impact: 'Medium',
      impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
      description: 'Response format changed',
      component: 'CitySearch.jsx',
      details: 'City search results parsing expects legacy structure with array wrapping.',
      lineNum: 'CitySearch.jsx:105',
      isConfirmed: true
    },
    {
      id: 'ep-3',
      endpoint: 'GET /notifications',
      service: 'Backend',
      impact: 'Medium',
      impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
      description: 'Data mapping required',
      component: 'WeatherAlertWorker.ts',
      details: 'Push notification engine filters on condition string which now includes localized tags.',
      lineNum: 'WeatherAlertWorker.ts:63',
      isConfirmed: false
    },
    {
      id: 'ep-4',
      endpoint: 'GET /user/preferences',
      service: 'Backend',
      impact: 'Low',
      impactClass: 'bg-green-50 text-green-600 border border-green-200',
      description: 'Optional field removed',
      component: 'UserPreferenceService.ts',
      details: 'Default fallback exists for legacy unit preferences. Non-breaking for end users.',
      lineNum: 'UserPreferenceService.ts:28',
      isConfirmed: false
    }
  ]
};

export const impactAnalysisMap = {
  'Weather API (Latest Change)': impactAnalysisData,
  'Weather API': impactAnalysisData,
  'GitHub API (Header Change)': {
    selectedApi: 'GitHub API (Header Change)',
    totalAffected: 3,
    breakdown: [
      { category: 'Frontend Pages', count: 1, examples: 'e.g. Repository Sync View', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 2, examples: 'e.g. Git Ingestion Worker, Webhook Relay', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 0, percentage: 0, color: '#EF4444' },
      medium: { count: 2, percentage: 67, color: '#F59E0B' },
      low: { count: 1, percentage: 33, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-gh-1',
        endpoint: 'GET /v1/repos',
        service: 'Backend',
        impact: 'Medium',
        impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
        description: 'New header x-github-api-version requires parsing',
        component: 'GithubAdapter.ts',
        details: 'Header caching layer needs update to forward version header.',
        lineNum: 'GithubAdapter.ts:51'
      },
      {
        id: 'ep-gh-2',
        endpoint: 'GET /v1/user/orgs',
        service: 'Frontend',
        impact: 'Low',
        impactClass: 'bg-green-50 text-green-600 border border-green-200',
        description: 'Optional metadata added',
        component: 'OrgSelector.jsx',
        details: 'Non-breaking change. Pass-through validation verified.',
        lineNum: 'OrgSelector.jsx:18'
      }
    ]
  },
  'Stripe API (Performance)': {
    selectedApi: 'Stripe API (Performance)',
    totalAffected: 4,
    breakdown: [
      { category: 'Frontend Pages', count: 2, examples: 'e.g. Checkout Modal, Subscription Manager', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 2, examples: 'e.g. Billing Dispatcher, Invoice Worker', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 1, percentage: 25, color: '#EF4444' },
      medium: { count: 2, percentage: 50, color: '#F59E0B' },
      low: { count: 1, percentage: 25, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-st-1',
        endpoint: 'POST /v1/payment_intents',
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Response latency 480ms exceeds 300ms SLA target',
        component: 'CheckoutForm.jsx',
        details: 'Users experience noticeable spinner delay during payment submission.',
        lineNum: 'CheckoutForm.jsx:77'
      },
      {
        id: 'ep-st-2',
        endpoint: 'GET /v1/invoices',
        service: 'Backend',
        impact: 'Medium',
        impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
        description: 'Batch webhook queue backlog elevated',
        component: 'InvoiceWorker.ts',
        details: 'Queue throughput dropped 14% due to upstream API latency.',
        lineNum: 'InvoiceWorker.ts:114'
      }
    ]
  },
  'User API (Schema Shift)': {
    selectedApi: 'User API (Schema Shift)',
    totalAffected: 2,
    breakdown: [
      { category: 'Frontend Pages', count: 2, examples: 'e.g. User Profile, Welcome Message', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 0, examples: 'Account Settings (unaffected)', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 2, percentage: 100, color: '#EF4444' },
      medium: { count: 0, percentage: 0, color: '#F59E0B' },
      low: { count: 0, percentage: 0, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-usr-1',
        endpoint: 'GET /v1/users/profile',
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Missing field: name -> display_name',
        component: 'UserProfile.jsx',
        details: 'Component relies on res.name. User profile header displays blank name if not mapped.',
        lineNum: 'UserProfile.jsx:34'
      },
      {
        id: 'ep-usr-2',
        endpoint: 'GET /v1/users/greeting',
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Welcome banner string interpolation failure',
        component: 'WelcomeMessage.jsx',
        details: 'Welcome message banner fails to interpolate user display name into welcome greeting string.',
        lineNum: 'WelcomeMessage.jsx:18'
      }
    ]
  },
  'Products API (Type Drift)': {
    selectedApi: 'Products API (Type Drift)',
    totalAffected: 4,
    breakdown: [
      { category: 'Frontend Pages', count: 3, examples: 'e.g. Product Detail, Cart Total, Search Results', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 1, examples: 'e.g. Checkout Service', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 2, percentage: 50, color: '#EF4444' },
      medium: { count: 2, percentage: 50, color: '#F59E0B' },
      low: { count: 0, percentage: 0, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-prod-1',
        endpoint: 'GET /v1/products/101',
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Field "price" string representation causes NaN in Cart Total',
        component: 'CartTotal.jsx',
        details: 'Type coercion missing: typeof price is string ("50"). Addition results in string concatenation and NaN total arithmetic.',
        lineNum: 'CartTotal.jsx:88',
        isConfirmed: true
      },
      {
        id: 'ep-prod-2',
        endpoint: 'POST /v1/checkout/calculate',
        service: 'Backend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Currency calculation validation schema exception',
        component: 'CheckoutService.ts',
        details: 'JSON schema validator enforces price: type number. Payload fails validation returning HTTP 422 Unprocessable Entity.',
        lineNum: 'CheckoutService.ts:142',
        isConfirmed: true
      },
      {
        id: 'ep-prod-3',
        endpoint: 'GET /v1/products/search',
        service: 'Frontend',
        impact: 'Medium',
        impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
        description: 'Price range filter slider sorting anomaly',
        component: 'SearchResults.jsx',
        details: 'Lexicographical sorting on string price causes $100 to sort before $50.',
        lineNum: 'SearchResults.jsx:62',
        isConfirmed: false
      }
    ]
  },
  'Payments API (Semantic Shift)': {
    selectedApi: 'Payments API (Semantic Shift)',
    totalAffected: 3,
    breakdown: [
      { category: 'Frontend Pages', count: 2, examples: 'e.g. Order Status, Payment Confirmation', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 1, examples: 'e.g. Immediate Checkout Worker', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 2, percentage: 67, color: '#EF4444' },
      medium: { count: 1, percentage: 33, color: '#F59E0B' },
      low: { count: 0, percentage: 0, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-pay-1',
        endpoint: 'GET /v1/payments/ORD-1',
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Status "PROCESSING" breaks synchronous settlement expectation',
        component: 'OrderStatus.jsx',
        details: 'Client expects immediate "PAID". "PROCESSING" status displays indefinite payment pending screen.',
        lineNum: 'OrderStatus.jsx:54',
        isConfirmed: true
      },
      {
        id: 'ep-pay-2',
        endpoint: 'POST /v1/checkout/confirm',
        service: 'Backend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Immediate checkout workflow terminates without webhook poll',
        component: 'ImmediateCheckout.ts',
        details: 'Asynchronous settlement requires webhook subscription or polling bridge adapter.',
        lineNum: 'ImmediateCheckout.ts:95',
        isConfirmed: true
      },
      {
        id: 'ep-pay-3',
        endpoint: 'POST /v1/webhooks/payment',
        service: 'Backend',
        impact: 'Medium',
        impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
        description: 'Payment listener registration queue delay',
        component: 'WebhookRelay.ts',
        details: 'Requires fallback timeout to prevent orphaned order checkout states.',
        lineNum: 'WebhookRelay.ts:31',
        isConfirmed: false
      }
    ]
  },
  'Inventory MCP Service (Param Rename)': {
    selectedApi: 'Inventory MCP Service (Param Rename)',
    totalAffected: 3,
    breakdown: [
      { category: 'Frontend Pages', count: 1, examples: 'e.g. Order Fulfillment View', icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 2, examples: 'e.g. Warehouse Dispatch, Inventory Sync', icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 2, percentage: 67, color: '#EF4444' },
      medium: { count: 1, percentage: 33, color: '#F59E0B' },
      low: { count: 0, percentage: 0, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: 'ep-inv-1',
        endpoint: 'mcp://inventory/tools/lookup_stock',
        service: 'MCP Server',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Tool invocation rejected: required argument "sku" missing',
        component: 'WarehouseDispatch.ts',
        details: 'MCP tool schema parameter was renamed from "sku" to "item_code". Autonomous agents fail tool call with invalid params.',
        lineNum: 'WarehouseDispatch.ts:47',
        isConfirmed: true
      },
      {
        id: 'ep-inv-2',
        endpoint: 'POST /v1/inventory/reserve',
        service: 'Backend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: 'Stock reservation worker runtime KeyError',
        component: 'InventorySyncWorker.ts',
        details: 'Worker expects params.sku; receiving params.item_code leaves item identifier undefined.',
        lineNum: 'InventorySyncWorker.ts:83',
        isConfirmed: true
      },
      {
        id: 'ep-inv-3',
        endpoint: 'GET /v1/orders/fulfillment',
        service: 'Frontend',
        impact: 'Medium',
        impactClass: 'bg-amber-50 text-amber-600 border border-amber-200',
        description: 'Estimated fulfillment date displayed with stock unknown badge',
        component: 'OrderFulfillment.jsx',
        details: 'Fulfillment UI displays degraded warning banner when inventory sync fails.',
        lineNum: 'OrderFulfillment.jsx:29',
        isConfirmed: false
      }
    ]
  }
};

export const getImpactAnalysis = (serviceIdentifier) => {
  if (!serviceIdentifier) return impactAnalysisData;
  const key = String(serviceIdentifier).trim();

  // 1. Direct match
  if (impactAnalysisMap[key]) return impactAnalysisMap[key];

  // 2. Fuzzy match
  const lower = key.toLowerCase();
  for (const [mapKey, val] of Object.entries(impactAnalysisMap)) {
    if (mapKey.toLowerCase().includes(lower) || lower.includes(mapKey.toLowerCase().split(' ')[0])) {
      return val;
    }
  }

  // 3. Fallback generic blast radius
  return {
    selectedApi: serviceIdentifier,
    totalAffected: 3,
    breakdown: [
      { category: 'Frontend Pages', count: 1, examples: `${serviceIdentifier} View`, icon: 'layout', accentColor: '#3B82F6' },
      { category: 'Backend Services', count: 2, examples: `${serviceIdentifier} Consumer Service`, icon: 'server', accentColor: '#6555FF' },
      { category: 'External Integrations', count: 0, examples: 'None affected', icon: 'share-2', accentColor: '#F59E0B' }
    ],
    severity: {
      high: { count: 1, percentage: 33, color: '#EF4444' },
      medium: { count: 2, percentage: 67, color: '#F59E0B' },
      low: { count: 0, percentage: 0, color: '#10B981' }
    },
    affectedEndpoints: [
      {
        id: `ep-${lower.replace(/[^a-z0-9]/g, '')}-1`,
        endpoint: `/api/${lower.replace(/[^a-z0-9]/g, '')}`,
        service: 'Frontend',
        impact: 'High',
        impactClass: 'bg-red-50 text-red-600 border border-red-200',
        description: `${serviceIdentifier} contract shift detected`,
        component: `${serviceIdentifier}Consumer.jsx`,
        details: 'Downstream component failed schema assertion.',
        lineNum: `${serviceIdentifier}Consumer.jsx:42`,
        isConfirmed: true
      }
    ]
  };
};

export const smartRepairData = {
  apiName: 'Weather API',
  title: 'Suggested Fix for Weather API',
  description: "The API response structure has changed. Here's the recommended fix:",
  instruction: 'Update your code to use the new field names:',
  filePath: 'src/services/weatherClient.js',
  diffLines: [
    { type: 'context', text: '  // Weather API consumer mapping' },
    { type: 'context', text: '  const response = await fetch(WEATHER_ENDPOINT);' },
    { type: 'context', text: '  const data = await response.json();' },
    { type: 'context', text: '  return {' },
    { type: 'removed', text: '-   temp: data.temp,' },
    { type: 'removed', text: '-   city: data.city' },
    { type: 'added',   text: '+   temperature: data.temperature ?? data.temp,' },
    { type: 'added',   text: '+   city_name: data.city_name ?? data.city' },
    { type: 'context', text: '  };' }
  ],
  rawFixCode: `// Autonomous backward-compatible patch
export function transformWeatherData(data) {
  return {
    temperature: data.temperature ?? data.temp,
    cityName: data.city_name ?? data.city,
    condition: data.condition,
    humidity: data.humidity
  };
}`,
  manualReviewNotes: [
    'Backward compatibility ensured: data.temperature ?? data.temp supports both legacy and updated schemas.',
    '3 downstream client components patched automatically.',
    'Test snapshot automatically generated in test/fixtures/weather_schema_v2.json.'
  ]
};

export const smartRepairDataMap = {
  'Weather API': smartRepairData,
  'weather': smartRepairData,
  'User API': {
    apiName: 'User API',
    title: 'Suggested Fix for User API',
    description: "The API response structure has changed. Field 'name' was replaced by 'display_name'.",
    instruction: 'Update your client adapter to map display_name to name:',
    filePath: 'src/services/userClient.js',
    diffLines: [
      { type: 'context', text: '  // User API consumer adapter' },
      { type: 'context', text: '  const response = await fetch(USER_ENDPOINT);' },
      { type: 'context', text: '  const data = await response.json();' },
      { type: 'context', text: '  return {' },
      { type: 'removed', text: '-   name: data.name,' },
      { type: 'added',   text: '+   name: data.display_name || data.name,' },
      { type: 'context', text: '    email: data.email' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Autonomous backward-compatible adapter
export function transformUserData(data) {
  return {
    id: data.id,
    name: data.display_name || data.name,
    email: data.email
  };
}`,
    manualReviewNotes: [
      'Semantics verified: "display_name" matches semantics of "name" with 98% NLP confidence.',
      'Protects downstream consumers: UserProfile.jsx and WelcomeMessage.jsx continue working seamlessly.',
      'Backward-compatible fallback: Supports both old and new schema structures.'
    ]
  },
  'users': {
    apiName: 'User API',
    title: 'Suggested Fix for User API',
    description: "The API response structure has changed. Field 'name' was replaced by 'display_name'.",
    instruction: 'Update your client adapter to map display_name to name:',
    filePath: 'src/services/userClient.js',
    diffLines: [
      { type: 'context', text: '  // User API consumer adapter' },
      { type: 'context', text: '  const response = await fetch(USER_ENDPOINT);' },
      { type: 'context', text: '  const data = await response.json();' },
      { type: 'context', text: '  return {' },
      { type: 'removed', text: '-   name: data.name,' },
      { type: 'added',   text: '+   name: data.display_name || data.name,' },
      { type: 'context', text: '    email: data.email' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Autonomous backward-compatible adapter
export function transformUserData(data) {
  return {
    id: data.id,
    name: data.display_name || data.name,
    email: data.email
  };
}`,
    manualReviewNotes: [
      'Semantics verified: "display_name" matches semantics of "name" with 98% NLP confidence.',
      'Protects downstream consumers: UserProfile.jsx and WelcomeMessage.jsx continue working seamlessly.',
      'Backward-compatible fallback: Supports both old and new schema structures.'
    ]
  },
  'Products API': {
    apiName: 'Products API',
    title: 'Suggested Fix for Products API',
    description: "Data type drift detected: field 'price' changed from number to string representation.",
    instruction: 'Add defensive type coercion in the product catalog adapter:',
    filePath: 'src/services/productCatalog.js',
    diffLines: [
      { type: 'context', text: '  // Products Catalog Adapter' },
      { type: 'context', text: '  const product = await response.json();' },
      { type: 'context', text: '  return {' },
      { type: 'context', text: '    id: product.id,' },
      { type: 'removed', text: '-   price: product.price,' },
      { type: 'added',   text: '+   price: typeof product.price === "string" ? parseFloat(product.price) : product.price,' },
      { type: 'context', text: '    inStock: product.inStock' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Autonomous defensive type coercer
export function adaptProductContract(data) {
  return {
    id: data.id,
    name: data.name,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    inStock: Boolean(data.inStock)
  };
}`,
    manualReviewNotes: [
      'Type contract guarded: Coerces string-encoded numbers back to native float.',
      'Prevents currency calculation and NaN arithmetic errors downstream.',
      'Manual engineering review recommended to align database column schema.'
    ]
  },
  'products': {
    apiName: 'Products API',
    title: 'Suggested Fix for Products API',
    description: "Data type drift detected: field 'price' changed from number to string representation.",
    instruction: 'Add defensive type coercion in the product catalog adapter:',
    filePath: 'src/services/productCatalog.js',
    diffLines: [
      { type: 'context', text: '  // Products Catalog Adapter' },
      { type: 'context', text: '  const product = await response.json();' },
      { type: 'context', text: '  return {' },
      { type: 'context', text: '    id: product.id,' },
      { type: 'removed', text: '-   price: product.price,' },
      { type: 'added',   text: '+   price: typeof product.price === "string" ? parseFloat(product.price) : product.price,' },
      { type: 'context', text: '    inStock: product.inStock' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Autonomous defensive type coercer
export function adaptProductContract(data) {
  return {
    id: data.id,
    name: data.name,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    inStock: Boolean(data.inStock)
  };
}`,
    manualReviewNotes: [
      'Type contract guarded: Coerces string-encoded numbers back to native float.',
      'Prevents currency calculation and NaN arithmetic errors downstream.',
      'Manual engineering review recommended to align database column schema.'
    ]
  },
  'Payments API': {
    apiName: 'Payments API',
    title: 'Suggested Semantic Adapter for Payments API',
    description: "Upstream gateway introduced asynchronous settlement: status 'PAID' shifted to 'PROCESSING'.",
    instruction: 'Bridge asynchronous settlement contract in payments handler:',
    filePath: 'src/services/paymentGateway.js',
    diffLines: [
      { type: 'context', text: '  // Payments Gateway Response Adapter' },
      { type: 'context', text: '  const tx = await response.json();' },
      { type: 'removed', text: '- if (tx.status === "PAID") completeCheckout(tx);' },
      { type: 'added',   text: '+ if (tx.status === "PROCESSING") registerWebhookListener(tx.transactionId);' },
      { type: 'added',   text: '+ const mappedStatus = tx.status === "PROCESSING" ? "PAID" : tx.status;' },
      { type: 'context', text: '  return { ...tx, status: mappedStatus };' }
    ],
    rawFixCode: `// Autonomous semantic state adapter
export function adaptPaymentStatus(data) {
  if (data.status === 'PROCESSING') {
    data._semanticShift = 'PROCESSING_MAPPED_TO_PAID';
    data.status = 'PAID';
  }
  return data;
}`,
    manualReviewNotes: [
      'Bridge adapter active: maps asynchronous PROCESSING state to synchronous client expectation.',
      'Webhook listener registered to capture final settlement event.',
      'Confidence: 0.68 — Requires explicit engineering review before production deploy.'
    ]
  },
  'payments': {
    apiName: 'Payments API',
    title: 'Suggested Semantic Adapter for Payments API',
    description: "Upstream gateway introduced asynchronous settlement: status 'PAID' shifted to 'PROCESSING'.",
    instruction: 'Bridge asynchronous settlement contract in payments handler:',
    filePath: 'src/services/paymentGateway.js',
    diffLines: [
      { type: 'context', text: '  // Payments Gateway Response Adapter' },
      { type: 'context', text: '  const tx = await response.json();' },
      { type: 'removed', text: '- if (tx.status === "PAID") completeCheckout(tx);' },
      { type: 'added',   text: '+ if (tx.status === "PROCESSING") registerWebhookListener(tx.transactionId);' },
      { type: 'added',   text: '+ const mappedStatus = tx.status === "PROCESSING" ? "PAID" : tx.status;' },
      { type: 'context', text: '  return { ...tx, status: mappedStatus };' }
    ],
    rawFixCode: `// Autonomous semantic state adapter
export function adaptPaymentStatus(data) {
  if (data.status === 'PROCESSING') {
    data._semanticShift = 'PROCESSING_MAPPED_TO_PAID';
    data.status = 'PAID';
  }
  return data;
}`,
    manualReviewNotes: [
      'Bridge adapter active: maps asynchronous PROCESSING state to synchronous client expectation.',
      'Webhook listener registered to capture final settlement event.',
      'Confidence: 0.68 — Requires explicit engineering review before production deploy.'
    ]
  },
  'GitHub API': {
    apiName: 'GitHub API',
    title: 'Suggested Fix for GitHub API',
    description: "Upstream API requires version header 'x-github-api-version' to ensure predictable contracts.",
    instruction: 'Inject version header into HTTP client wrapper:',
    filePath: 'src/services/githubClient.js',
    diffLines: [
      { type: 'context', text: '  // GitHub API request headers' },
      { type: 'context', text: '  headers: {' },
      { type: 'context', text: '    "Accept": "application/vnd.github+json",' },
      { type: 'added',   text: '+   "x-github-api-version": "2024-04-01",' },
      { type: 'context', text: '    "Authorization": `Bearer ${token}`' },
      { type: 'context', text: '  }' }
    ],
    rawFixCode: `// Header compatibility injector
export function getGitHubHeaders(token) {
  return {
    'Accept': 'application/vnd.github+json',
    'x-github-api-version': '2024-04-01',
    'Authorization': \`Bearer \${token}\`
  };
}`,
    manualReviewNotes: [
      'Puddles breaking header requirement: pinned to stable API version 2024-04-01.',
      'Applies across all GitHub repository querying endpoints.'
    ]
  },
  'github': {
    apiName: 'GitHub API',
    title: 'Suggested Fix for GitHub API',
    description: "Upstream API requires version header 'x-github-api-version' to ensure predictable contracts.",
    instruction: 'Inject version header into HTTP client wrapper:',
    filePath: 'src/services/githubClient.js',
    diffLines: [
      { type: 'context', text: '  // GitHub API request headers' },
      { type: 'context', text: '  headers: {' },
      { type: 'context', text: '    "Accept": "application/vnd.github+json",' },
      { type: 'added',   text: '+   "x-github-api-version": "2024-04-01",' },
      { type: 'context', text: '    "Authorization": `Bearer ${token}`' },
      { type: 'context', text: '  }' }
    ],
    rawFixCode: `// Header compatibility injector
export function getGitHubHeaders(token) {
  return {
    'Accept': 'application/vnd.github+json',
    'x-github-api-version': '2024-04-01',
    'Authorization': \`Bearer \${token}\`
  };
}`,
    manualReviewNotes: [
      'Puddles breaking header requirement: pinned to stable API version 2024-04-01.',
      'Applies across all GitHub repository querying endpoints.'
    ]
  },
  'Stripe API': {
    apiName: 'Stripe API',
    title: 'Suggested Optimization for Stripe API',
    description: "Round-trip latency degraded to 480ms (>300ms SLA). Circuit breaker & retry backoff recommended.",
    instruction: 'Configure exponential backoff and timeout threshold:',
    filePath: 'src/services/stripeClient.js',
    diffLines: [
      { type: 'context', text: '  // Stripe HTTP timeout & retry configuration' },
      { type: 'removed', text: '- timeout: 10000,' },
      { type: 'added',   text: '+ timeout: 5000,' },
      { type: 'added',   text: '+ maxNetworkRetries: 3,' },
      { type: 'added',   text: '+ circuitBreaker: { threshold: 0.5, timeoutMs: 300 },' }
    ],
    rawFixCode: `// Autonomous latency resilience wrapper
export const stripeConfig = {
  timeout: 5000,
  maxNetworkRetries: 3,
  telemetry: true,
  circuitBreaker: { threshold: 0.5, timeoutMs: 300 }
};`,
    manualReviewNotes: [
      'Performance drift mitigated: isolates high-latency upstream responses from blocking UI thread.',
      'Circuit breaker opens if latency consistently exceeds 300ms SLA.'
    ]
  },
  'stripe': {
    apiName: 'Stripe API',
    title: 'Suggested Optimization for Stripe API',
    description: "Round-trip latency degraded to 480ms (>300ms SLA). Circuit breaker & retry backoff recommended.",
    instruction: 'Configure exponential backoff and timeout threshold:',
    filePath: 'src/services/stripeClient.js',
    diffLines: [
      { type: 'context', text: '  // Stripe HTTP timeout & retry configuration' },
      { type: 'removed', text: '- timeout: 10000,' },
      { type: 'added',   text: '+ timeout: 5000,' },
      { type: 'added',   text: '+ maxNetworkRetries: 3,' },
      { type: 'added',   text: '+ circuitBreaker: { threshold: 0.5, timeoutMs: 300 },' }
    ],
    rawFixCode: `// Autonomous latency resilience wrapper
export const stripeConfig = {
  timeout: 5000,
  maxNetworkRetries: 3,
  telemetry: true,
  circuitBreaker: { threshold: 0.5, timeoutMs: 300 }
};`,
    manualReviewNotes: [
      'Performance drift mitigated: isolates high-latency upstream responses from blocking UI thread.',
      'Circuit breaker opens if latency consistently exceeds 300ms SLA.'
    ]
  },
  'Inventory MCP Service': {
    apiName: 'Inventory MCP Service',
    title: 'Suggested Fix for Inventory MCP Tool',
    description: "Tool contract renamed parameter 'sku' to 'item_code'. Compatibility adapter maps invocation keys.",
    instruction: 'Update MCP tool caller invocation mapping:',
    filePath: 'src/mcp/tools/inventoryAdapter.js',
    diffLines: [
      { type: 'context', text: '  // MCP Tool parameter invocation' },
      { type: 'context', text: '  const params = {' },
      { type: 'removed', text: '-   sku: item.sku' },
      { type: 'added',   text: '+   item_code: item.sku ?? item.item_code' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Inventory MCP Tool adapter
export function adaptInventoryParams(params) {
  if (params.sku !== undefined && params.item_code === undefined) {
    params.item_code = params.sku;
  }
  return params;
}`,
    manualReviewNotes: [
      'MCP contract repaired: translates legacy agent "sku" parameters to "item_code".',
      'Autonomous agent tool execution validated with 100% test integrity.'
    ]
  },
  'inventory-mcp': {
    apiName: 'Inventory MCP Service',
    title: 'Suggested Fix for Inventory MCP Tool',
    description: "Tool contract renamed parameter 'sku' to 'item_code'. Compatibility adapter maps invocation keys.",
    instruction: 'Update MCP tool caller invocation mapping:',
    filePath: 'src/mcp/tools/inventoryAdapter.js',
    diffLines: [
      { type: 'context', text: '  // MCP Tool parameter invocation' },
      { type: 'context', text: '  const params = {' },
      { type: 'removed', text: '-   sku: item.sku' },
      { type: 'added',   text: '+   item_code: item.sku ?? item.item_code' },
      { type: 'context', text: '  };' }
    ],
    rawFixCode: `// Inventory MCP Tool adapter
export function adaptInventoryParams(params) {
  if (params.sku !== undefined && params.item_code === undefined) {
    params.item_code = params.sku;
  }
  return params;
}`,
    manualReviewNotes: [
      'MCP contract repaired: translates legacy agent "sku" parameters to "item_code".',
      'Autonomous agent tool execution validated with 100% test integrity.'
    ]
  }
};

export const getSmartRepairData = (serviceIdentifier) => {
  if (!serviceIdentifier) return null;
  const key = String(serviceIdentifier).trim();
  if (smartRepairDataMap[key]) return smartRepairDataMap[key];
  const lower = key.toLowerCase();
  for (const [k, val] of Object.entries(smartRepairDataMap)) {
    if (k.toLowerCase() === lower || (val.apiName && val.apiName.toLowerCase() === lower)) {
      return val;
    }
  }
  // Generic safe adapter fallback for any dynamic service
  return {
    apiName: serviceIdentifier,
    title: `Suggested Adapter for ${serviceIdentifier}`,
    description: `Automated compatibility layer generated for ${serviceIdentifier} schema variation.`,
    instruction: 'Update client consumption layer with defensive boundary:',
    filePath: `src/services/${lower.replace(/[^a-z0-9]/g, '_')}Client.js`,
    diffLines: [
      { type: 'context', text: `  // Boundary adapter for ${serviceIdentifier}` },
      { type: 'removed', text: '-  return await response.json();' },
      { type: 'added',   text: '+  const raw = await response.json();' },
      { type: 'added',   text: '+  return sanitizeAndNormalize(raw);' }
    ],
    rawFixCode: `// Autonomous defensive boundary adapter\nexport function adapt${lower.replace(/[^a-z0-9]/g, '')}Response(data) {\n  return sanitizeAndNormalize(data);\n}`,
    manualReviewNotes: [
      'Defensive mapping applied at gateway boundary.',
      'Prevents client consumer runtime TypeError exceptions.',
      'Validated against regression schema contract.'
    ]
  };
};

export const validationTestsList = [
  {
    id: 'test-1',
    name: 'API Response Structure',
    status: 'Passed',
    duration: '42ms',
    details: 'Validated JSON schema keys: [temperature, city_name, condition, humidity]'
  },
  {
    id: 'test-2',
    name: 'Data Integrity',
    status: 'Passed',
    duration: '65ms',
    details: 'Verified type contracts: temperature is Float, city_name is String.'
  },
  {
    id: 'test-3',
    name: 'Dependent Services',
    status: 'Passed',
    duration: '110ms',
    details: 'Notification Service, City Search, and Dashboard responded with HTTP 200 OK.'
  },
  {
    id: 'test-4',
    name: 'Frontend Functionality',
    status: 'Passed',
    duration: '158ms',
    details: 'React DOM rendered WeatherCard and CitySearch components without console errors.'
  },
  {
    id: 'test-5',
    name: 'Performance Check',
    status: 'Passed',
    duration: '74ms',
    details: 'p99 latency 248ms (within <300ms SLA threshold).'
  }
];

export const uptimeSeriesData = [
  { time: '12 AM', latency: 210, uptime: 100 },
  { time: '2 AM', latency: 205, uptime: 100 },
  { time: '4 AM', latency: 218, uptime: 99.8 },
  { time: '6 AM', latency: 212, uptime: 100 },
  { time: '8 AM', latency: 235, uptime: 99.9 },
  { time: '10 AM', latency: 260, uptime: 98.4 },
  { time: '12 PM', latency: 252, uptime: 99.2 },
  { time: '2 PM', latency: 245, uptime: 99.8 },
  { time: '4 PM', latency: 240, uptime: 100 },
  { time: '6 PM', latency: 255, uptime: 99.5 },
  { time: '8 PM', latency: 248, uptime: 99.9 },
  { time: '10 PM', latency: 238, uptime: 100 },
];
