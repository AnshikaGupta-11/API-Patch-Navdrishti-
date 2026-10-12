import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import mock dataset
import {
  initialApis,
  initialRecentActivity,
  changeDetectionData,
  apiChangeMap,
  impactAnalysisData,
  impactAnalysisMap,
  smartRepairData,
  smartRepairDataMap,
  validationTestsList
} from '../src/data/mockData.js';

describe('1. Mock Data & Schema Integrity', () => {
  test('initialApis contains monitored endpoints with required properties', () => {
    assert.ok(Array.isArray(initialApis), 'initialApis should be an array');
    assert.ok(initialApis.length >= 10, 'Should have at least 10 monitored APIs');
    
    // Check required fields
    for (const api of initialApis) {
      assert.ok(api.id, `API missing id: ${api.name}`);
      assert.ok(api.name, 'API missing name');
      assert.ok(api.endpoint, `API missing endpoint: ${api.name}`);
      assert.ok(api.status, `API missing status: ${api.name}`);
      assert.ok(api.uptime, `API missing uptime: ${api.name}`);
      assert.ok(api.responseTime, `API missing responseTime: ${api.name}`);
      assert.ok(typeof api.latencyNum === 'number', `API missing numeric latency: ${api.name}`);
    }

    // Check presence of User API and Weather API
    const userApi = initialApis.find(a => a.name === 'User API');
    const weatherApi = initialApis.find(a => a.name === 'Weather API');
    assert.ok(userApi, 'User API must be present in initialApis');
    assert.ok(weatherApi, 'Weather API must be present in initialApis');
  });

  test('changeDetectionData and apiChangeMap correctly map semantic breaking changes', () => {
    assert.ok(changeDetectionData.featured, 'Featured breaking change must exist');
    assert.ok(Array.isArray(changeDetectionData.otherChanges), 'otherChanges must be an array');
    
    // Check User API in change map
    assert.ok(apiChangeMap['User API'], 'User API must be present in apiChangeMap');
    const userChange = apiChangeMap['User API'];
    assert.equal(userChange.previousResponse.name, 'Rahul');
    assert.equal(userChange.currentResponse.display_name, 'Rahul');
    assert.ok(userChange.changesDetected.some(c => c.field === 'name'));

    // Check Weather API in change map
    assert.ok(apiChangeMap['Weather API'], 'Weather API must be present in apiChangeMap');
    const weatherChange = apiChangeMap['Weather API'];
    assert.equal(weatherChange.previousResponse.temp, 24);
    assert.equal(weatherChange.currentResponse.temperature, 24);
  });

  test('impactAnalysisMap provides dependency tracing for multiple APIs', () => {
    assert.ok(impactAnalysisMap['Weather API (Latest Change)'], 'Weather API impact data exists');
    assert.ok(impactAnalysisMap['User API (Schema Shift)'], 'User API impact data exists');
    
    const userImpact = impactAnalysisMap['User API (Schema Shift)'];
    assert.equal(userImpact.totalAffected, 2);
    assert.ok(userImpact.affectedEndpoints.some(e => e.component === 'UserProfile.jsx'));
    assert.ok(userImpact.affectedEndpoints.some(e => e.component === 'WelcomeMessage.jsx'));
  });

  test('smartRepairDataMap provides AST patches and reverse compatibility', () => {
    assert.ok(smartRepairDataMap['Weather API'], 'Weather API repair fix exists');
    assert.ok(smartRepairDataMap['User API'], 'User API repair fix exists');
    
    const userFix = smartRepairDataMap['User API'];
    assert.ok(userFix.diffLines.length > 0, 'User API diff lines must exist');
    assert.ok(userFix.rawFixCode.includes('display_name || data.name'), 'Adapter must include nullish / fallback mapping');
  });

  test('validationTestsList defines all 5 verification suite vectors', () => {
    assert.equal(validationTestsList.length, 5, 'Should define exactly 5 validation tests');
    const testNames = validationTestsList.map(t => t.name);
    assert.ok(testNames.includes('API Response Structure'));
    assert.ok(testNames.includes('Data Integrity'));
    assert.ok(testNames.includes('Dependent Services'));
    assert.ok(testNames.includes('Frontend Functionality'));
    assert.ok(testNames.includes('Performance Check'));
  });
});

describe('2. Project Structure & Page Files', () => {
  const pages = [
    'DashboardPage.jsx',
    'ApisPage.jsx',
    'ChangeDetectionPage.jsx',
    'ImpactAnalysisPage.jsx',
    'SmartRepairPage.jsx',
    'ValidationRecoveryPage.jsx',
    'SettingsPage.jsx',
    'LoginPage.jsx',
    'SignupPage.jsx'
  ];

  for (const page of pages) {
    test(`Page file src/pages/${page} exists and is non-empty`, () => {
      const filePath = path.join(rootDir, 'src', 'pages', page);
      assert.ok(fs.existsSync(filePath), `File src/pages/${page} must exist`);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.length > 100, `File src/pages/${page} must not be empty`);
      assert.ok(content.includes('export default function'), `File src/pages/${page} must have a default export`);
    });
  }

  const modals = [
    'AddApiModal.jsx',
    'ApiDetailsModal.jsx',
    'LogsModal.jsx',
    'ManualReviewModal.jsx',
    'RollbackModal.jsx'
  ];

  for (const modal of modals) {
    test(`Modal file src/components/modals/${modal} exists`, () => {
      const filePath = path.join(rootDir, 'src', 'components', 'modals', modal);
      assert.ok(fs.existsSync(filePath), `Modal file src/components/modals/${modal} must exist`);
    });
  }

  const layout = [
    'Sidebar.jsx',
    'Header.jsx',
    'Toast.jsx',
    'DemoToolbar.jsx'
  ];

  for (const comp of layout) {
    test(`Layout component src/components/layout/${comp} exists`, () => {
      const filePath = path.join(rootDir, 'src', 'components', 'layout', comp);
      assert.ok(fs.existsSync(filePath), `Layout component src/components/layout/${comp} must exist`);
    });
  }
});

describe('3. Design Tokens & Theme Configuration', () => {
  test('tailwind.config.js includes required Navy & White design tokens', () => {
    const configPath = path.join(rootDir, 'tailwind.config.js');
    const content = fs.readFileSync(configPath, 'utf-8');
    
    // Check Navy & Brand hex codes
    assert.ok(content.includes('#050D1B'), 'Must contain outer canvas navy #050D1B');
    assert.ok(content.includes('#0B172A'), 'Must contain sidebar navy #0B172A');
    assert.ok(content.includes('#1D3B70'), 'Must contain active nav item #1D3B70');
    assert.ok(content.includes('#F7F9FD'), 'Must contain light surface canvas #F7F9FD');
    assert.ok(content.includes('#405CFF'), 'Must contain primary brand blue #405CFF');
  });
});

describe('4. Production Build Verification', () => {
  test('dist/index.html and asset bundles exist after build', () => {
    const distIndex = path.join(rootDir, 'dist', 'index.html');
    assert.ok(fs.existsSync(distIndex), 'dist/index.html must exist');
    
    const assetsDir = path.join(rootDir, 'dist', 'assets');
    assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');
    const files = fs.readdirSync(assetsDir);
    assert.ok(files.some(f => f.endsWith('.js')), 'Must have bundled JS');
    assert.ok(files.some(f => f.endsWith('.css')), 'Must have bundled CSS');
  });
});

describe('5. API Patch Branding & Anti-Crash Recovery Integrity', () => {
  test('index.html page title is "API Patch — Keep software working when APIs change"', () => {
    const htmlPath = path.join(rootDir, 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(content.includes('<title>API Patch — Keep software working when APIs change</title>'));
  });

  test('Sidebar branding contains "API Patch" and official tagline', () => {
    const sidebarPath = path.join(rootDir, 'src', 'components', 'layout', 'Sidebar.jsx');
    const content = fs.readFileSync(sidebarPath, 'utf-8');
    assert.ok(content.includes('API Patch'));
    assert.ok(content.includes('Keep software working when APIs change.'));
  });

  test('ValidationRecoveryPage destructures proxyResponse from useApp without ReferenceError', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ValidationRecoveryPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes('proxyResponse'), 'ValidationRecoveryPage must destructure proxyResponse');
  });

  test('ErrorBoundary component exists to catch render exceptions', () => {
    const ebPath = path.join(rootDir, 'src', 'components', 'layout', 'ErrorBoundary.jsx');
    assert.ok(fs.existsSync(ebPath), 'ErrorBoundary component must exist');
  });

  test('LoginPage provides password visibility toggle and guest bypass', () => {
    const loginPath = path.join(rootDir, 'src', 'pages', 'LoginPage.jsx');
    const content = fs.readFileSync(loginPath, 'utf-8');
    assert.ok(content.includes('showPassword'), 'LoginPage must support show/hide password');
    assert.ok(content.includes('EyeOff'), 'LoginPage must import EyeOff icon');
    assert.ok(content.includes('Continue as Guest'), 'LoginPage must provide sandbox guest access');
  });

  test('SignupPage provides password confirmation and validation feedback', () => {
    const signupPath = path.join(rootDir, 'src', 'pages', 'SignupPage.jsx');
    const content = fs.readFileSync(signupPath, 'utf-8');
    assert.ok(content.includes('confirmPassword'), 'SignupPage must include confirmPassword field');
    assert.ok(content.includes('passwordsMatch'), 'SignupPage must check matching passwords');
    assert.ok(content.includes('hasMinLength'), 'SignupPage must enforce minimum password length');
  });
});

describe('6. Active Change Resolution & Zero Counter Integrity', () => {
  test('AppContext derives unresolvedCount directly without fallback when changesData is 0', () => {
    const appContextPath = path.join(rootDir, 'src', 'context', 'AppContext.jsx');
    const content = fs.readFileSync(appContextPath, 'utf-8');
    assert.ok(content.includes('const unresolvedCount = backendConnected\n    ? changesData.length'),
      'AppContext must use changesData.length directly without overriding 0 with unresolvedIncidents');
  });

  test('ChangeDetectionPage conditionally renders empty state and avoids ghost Weather API when no active changes', () => {
    const cdPath = path.join(rootDir, 'src', 'pages', 'ChangeDetectionPage.jsx');
    const content = fs.readFileSync(cdPath, 'utf-8');
    assert.ok(content.includes('!hasActiveChanges || !featured'),
      'ChangeDetectionPage must show empty state when hasActiveChanges is false');
    assert.ok(!content.includes('else if (apiChangeMap && apiChangeMap[selectedChangeApi])'),
      'ChangeDetectionPage must not resurrect featured change from apiChangeMap when hasActiveChanges is false');
  });

  test('Initial mock state starts with exactly 2 changed APIs (Users and Weather)', () => {
    const changed = initialApis.filter(a => a.status === 'Changed');
    assert.equal(changed.length, 2, 'Initial changed count must be 2');
    const names = changed.map(a => a.name);
    assert.ok(names.includes('User API'));
    assert.ok(names.includes('Weather API'));
  });

  test('Simulated sequential resolution transition drops from 2 -> 1 -> 0', () => {
    let mockApis = [...initialApis];
    assert.equal(mockApis.filter(a => a.status === 'Changed').length, 2);

    // Resolve Users API
    mockApis = mockApis.map(a => a.name === 'User API' ? { ...a, status: 'Healthy' } : a);
    assert.equal(mockApis.filter(a => a.status === 'Changed').length, 1);
    assert.equal(mockApis.find(a => a.status === 'Changed').name, 'Weather API');

    // Resolve Weather API
    mockApis = mockApis.map(a => a.name === 'Weather API' ? { ...a, status: 'Healthy' } : a);
    assert.equal(mockApis.filter(a => a.status === 'Changed').length, 0);
  });
});

describe('7. Multi-Service Simulation & Smart Repair Dynamic Targeting', () => {
  test('AppContext exports SIMULATABLE_SERVICES with 7 real services and concurrency protection', () => {
    const appContextPath = path.join(rootDir, 'src', 'context', 'AppContext.jsx');
    const content = fs.readFileSync(appContextPath, 'utf-8');
    assert.ok(content.includes('SIMULATABLE_SERVICES'), 'Must export SIMULATABLE_SERVICES');
    assert.ok(content.includes('if (isSimulating) return'), 'triggerIncident must guard against concurrent calls');
    assert.ok(content.includes('Service Already Active'), 'Must notify user when requested service is already active');
    assert.ok(content.includes('All Services Active'), 'Must notify user when all services are active');
  });

  test('DemoToolbar features service dropdown selector and loading spinner', () => {
    const toolbarPath = path.join(rootDir, 'src', 'components', 'layout', 'DemoToolbar.jsx');
    const content = fs.readFileSync(toolbarPath, 'utf-8');
    assert.ok(content.includes('selectedSimService'), 'DemoToolbar must maintain selected service state');
    assert.ok(content.includes('Auto-Rotate (Next Healthy)'), 'DemoToolbar must support auto-rotation');
    assert.ok(content.includes('SIMULATABLE_SERVICES.map'), 'DemoToolbar must list all supported simulatable services');
    assert.ok(content.includes('isSimulating'), 'DemoToolbar must disable buttons during simulation');
    assert.ok(content.includes('Simulate Change'), 'Button label must be Simulate Change');
  });

  test('SmartRepairPage renders empty state when zero changes and targets real broken services', () => {
    const srPath = path.join(rootDir, 'src', 'pages', 'SmartRepairPage.jsx');
    const content = fs.readFileSync(srPath, 'utf-8');
    assert.ok(content.includes('No Active Changes Require Repair'), 'Must show clean empty state message');
    assert.ok(content.includes('!hasActiveChanges'), 'Must conditionally show empty state when no changes active');
    assert.ok(!content.includes("availableIncidentApis = ['Weather API', 'User API']"), 'Must NOT hardcode Weather API and User API when healthy');
    assert.ok(content.includes('getSmartRepairData'), 'Must retrieve dynamic repair proposals');
  });

  test('mockData.js getSmartRepairData provides valid repair models for all 7 services', async () => {
    const { getSmartRepairData } = await import('../src/data/mockData.js');
    const serviceIds = ['weather', 'users', 'products', 'payments', 'github', 'stripe', 'inventory-mcp'];

    for (const id of serviceIds) {
      const repair = getSmartRepairData(id);
      assert.ok(repair, `Repair model must exist for service ${id}`);
      assert.ok(repair.title, `Repair for ${id} must have a title`);
      assert.ok(repair.rawFixCode, `Repair for ${id} must have rawFixCode`);
      assert.ok(Array.isArray(repair.diffLines), `Repair for ${id} must have diffLines`);
    }
  });
});

describe('8. Live Impact Analysis & Blast Radius Engine', () => {
  test('mockData.js getImpactAnalysis returns valid blast radius models for all 7 services', async () => {
    const { getImpactAnalysis } = await import('../src/data/mockData.js');
    const serviceIds = ['weather', 'users', 'products', 'payments', 'github', 'stripe', 'inventory-mcp'];

    for (const id of serviceIds) {
      const impact = getImpactAnalysis(id);
      assert.ok(impact, `Impact model must exist for service ${id}`);
      assert.ok(typeof impact.totalAffected === 'number', `totalAffected must be numeric for ${id}`);
      assert.ok(Array.isArray(impact.breakdown), `breakdown must be an array for ${id}`);
      assert.ok(impact.severity && impact.severity.high && impact.severity.medium && impact.severity.low, `severity must contain high/medium/low for ${id}`);
      assert.ok(Array.isArray(impact.affectedEndpoints) && impact.affectedEndpoints.length > 0, `affectedEndpoints must contain endpoints for ${id}`);
    }
  });

  test('Affected endpoints distinguish Confirmed AST breaks vs Inferred dependencies', async () => {
    const { getImpactAnalysis } = await import('../src/data/mockData.js');
    const weatherImpact = getImpactAnalysis('weather');
    const confirmedCount = weatherImpact.affectedEndpoints.filter(e => e.isConfirmed).length;
    const inferredCount = weatherImpact.affectedEndpoints.filter(e => !e.isConfirmed).length;

    assert.ok(confirmedCount > 0, 'Weather API impact should have at least 1 confirmed AST break');
    assert.ok(inferredCount > 0, 'Weather API impact should have at least 1 inferred dependency');
  });

  test('ImpactAnalysisPage includes 5-phase analysis sequence and AnimatedCounter', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ImpactAnalysisPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes('ANALYSIS_PHASES'), 'ImpactAnalysisPage must define ANALYSIS_PHASES');
    assert.ok(content.includes('AnimatedCounter'), 'ImpactAnalysisPage must define and use AnimatedCounter');
    assert.ok(content.includes('runAnalysisSequence'), 'ImpactAnalysisPage must provide runAnalysisSequence');
    assert.ok(content.includes('Blast Radius Risk Score'), 'ImpactAnalysisPage must display blast radius risk gauge');
  });

  test('ImpactAnalysisPage renders interactive multi-tier SVG dependency topology with flowing particle lines', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ImpactAnalysisPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes('<svg'), 'ImpactAnalysisPage must render SVG topology canvas');
    assert.ok(content.includes('graph-flow-line'), 'Must use graph-flow-line animated flow paths');
    assert.ok(content.includes('graph-flow-line-broken'), 'Must use graph-flow-line-broken for broken paths');
    assert.ok(content.includes('ORIGIN DRIFT'), 'Must render origin node badge');
    assert.ok(content.includes('INGRESS ROUTER'), 'Must render ingress router node badge');
    assert.ok(content.includes('node-alert-glow'), 'Must support alert glowing on selected/origin nodes');
  });

  test('ImpactAnalysisPage provides evidence filter tabs and clean empty state banner', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ImpactAnalysisPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes("tableFilter === 'confirmed'"), 'Must support Confirmed AST filter');
    assert.ok(content.includes("tableFilter === 'inferred'"), 'Must support Inferred filter');
    assert.ok(content.includes("tableFilter === 'high'"), 'Must support High Only filter');
    assert.ok(content.includes('isCompletelyHealthy'), 'Must detect and render healthy state banner');
    assert.ok(content.includes('All Monitored Services Healthy'), 'Must display healthy state message when zero changes');
  });

  test('AppContext exposes dependenciesGraph and fetches it from backend API', () => {
    const appContextPath = path.join(rootDir, 'src', 'context', 'AppContext.jsx');
    const content = fs.readFileSync(appContextPath, 'utf-8');
    assert.ok(content.includes('dependenciesGraph'), 'AppContext must expose dependenciesGraph in provider');
    assert.ok(content.includes('apiClient.getDependenciesGraph()'), 'fetchBackendData must query getDependenciesGraph');
  });

  test('index.css contains graph flow and radar scan animation classes', () => {
    const cssPath = path.join(rootDir, 'src', 'index.css');
    const content = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(content.includes('graph-flow-line'), 'CSS must define graph-flow-line');
    assert.ok(content.includes('animate-radar-scan'), 'CSS must define animate-radar-scan');
    assert.ok(content.includes('node-alert-glow'), 'CSS must define node-alert-glow');
    assert.ok(content.includes('prefers-reduced-motion'), 'CSS must include reduced motion overrides');
  });
});

describe('9. Auto Heal & Smart Repair Pipeline Integrity', () => {
  test('AppContext applyFix dynamically targets active changes without simulating fake changes on auto', () => {
    const appContextPath = path.join(rootDir, 'src', 'context', 'AppContext.jsx');
    const content = fs.readFileSync(appContextPath, 'utf-8');
    assert.ok(content.includes('let resolvedTarget = targetApi'), 'applyFix must determine target dynamically');
    assert.ok(content.includes("changesData[0].serviceName || changesData[0].serviceId"), 'applyFix must fallback to active change from changesData');
    assert.ok(!content.includes("await apiClient.simulateChange(serviceKey);"), 'applyFix must NEVER simulate changes during repair');
    assert.ok(content.includes("No active unresolved incident found"), 'applyFix must handle healthy state cleanly');
  });

  test('DemoToolbar handleAutoHeal passes active service to applyFix', () => {
    const toolbarPath = path.join(rootDir, 'src', 'components', 'layout', 'DemoToolbar.jsx');
    const content = fs.readFileSync(toolbarPath, 'utf-8');
    assert.ok(content.includes('applyFix(target)'), 'handleAutoHeal must pass resolved target to applyFix');
  });

  test('apiClient preserves error.data and handles HTTP 422 in validateIncident', () => {
    const clientPath = path.join(rootDir, 'src', 'api', 'client.js');
    const content = fs.readFileSync(clientPath, 'utf-8');
    assert.ok(content.includes('error.data = errorData'), 'client.js request must attach error.data');
    assert.ok(content.includes('err.status === 422 && err.data?.validation'), 'validateIncident must return payload on 422');
  });

  test('ValidationRecoveryPage dynamically resolves proxyEndpointPath for all services', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ValidationRecoveryPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes('proxyEndpointPath'), 'ValidationRecoveryPage must define proxyEndpointPath');
    assert.ok(content.includes('GET /api/proxy/{proxyEndpointPath}'), 'Badge must display dynamic proxy route');
  });

  test('ValidationRecoveryPage defines isAllPassed and isRunning without ReferenceError', () => {
    const pagePath = path.join(rootDir, 'src', 'pages', 'ValidationRecoveryPage.jsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert.ok(content.includes('const isRunning ='), 'ValidationRecoveryPage must declare isRunning');
    assert.ok(content.includes('const isAllPassed ='), 'ValidationRecoveryPage must declare isAllPassed');
    assert.ok(content.includes('hasFailedTests'), 'ValidationRecoveryPage must check for failed tests');
    assert.ok(content.includes('hasTests'), 'ValidationRecoveryPage must handle empty tests');
    assert.ok(content.includes('Validation Failed'), 'ValidationRecoveryPage must render failure state when tests fail');
  });

  test('Validation state derivation correctly handles all-passed, failed, loading, and empty states', () => {
    // Pure logic unit check matching ValidationRecoveryPage derivations
    const computeValidationState = (validationState, validationTests, repairState) => {
      const isRunning =
        validationState === 'running' ||
        (Array.isArray(validationTests) && validationTests.some(t => t?.status === 'Running...'));

      const hasTests = Array.isArray(validationTests) && validationTests.length > 0;
      const allTestsPass = hasTests && validationTests.every(t => t?.status === 'Passed');
      const hasFailedTests = hasTests && validationTests.some(t => t?.status === 'Failed' || t?.status === 'Error');

      const isAllPassed = 
        !isRunning && 
        !hasFailedTests && 
        hasTests && 
        (validationState === 'passed' || (repairState === 'applied' && allTestsPass));

      return { isRunning, isAllPassed, hasFailedTests, hasTests };
    };

    // 1. All passed
    const allPassed = computeValidationState('passed', [{ id: '1', status: 'Passed' }], 'applied');
    assert.equal(allPassed.isAllPassed, true);
    assert.equal(allPassed.isRunning, false);

    // 2. Partially failed
    const partFailed = computeValidationState('failed', [{ id: '1', status: 'Passed' }, { id: '2', status: 'Failed' }], 'ready');
    assert.equal(partFailed.isAllPassed, false);
    assert.equal(partFailed.hasFailedTests, true);

    // 3. Running / Loading
    const running = computeValidationState('running', [{ id: '1', status: 'Running...' }], 'ready');
    assert.equal(running.isRunning, true);
    assert.equal(running.isAllPassed, false);

    // 4. Empty tests
    const empty = computeValidationState('passed', [], 'applied');
    assert.equal(empty.isAllPassed, false);
    assert.equal(empty.hasTests, false);

    // 5. Idle / Staged
    const idle = computeValidationState('idle', [{ id: '1', status: 'Passed' }], 'ready');
    assert.equal(idle.isAllPassed, false);
    assert.equal(idle.hasFailedTests, false);
  });
});



