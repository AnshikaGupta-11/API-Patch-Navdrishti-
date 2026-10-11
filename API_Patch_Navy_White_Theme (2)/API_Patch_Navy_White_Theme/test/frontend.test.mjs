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
    'SettingsPage.jsx'
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
});

