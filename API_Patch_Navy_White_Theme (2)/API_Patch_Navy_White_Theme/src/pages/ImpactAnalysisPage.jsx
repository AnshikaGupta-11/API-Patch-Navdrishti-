import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GitFork, 
  Layout, 
  Server, 
  Share2, 
  ChevronRight, 
  ChevronDown, 
  ArrowRight, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  FileCode,
  X,
  Activity,
  ShieldCheck,
  RefreshCw,
  Zap,
  Search,
  Filter,
  Info,
  ExternalLink,
  Eye,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { impactAnalysisData, impactAnalysisMap, getImpactAnalysis } from '../data/mockData';
import { apiClient } from '../api/client';

// Animated integer counter component
function AnimatedCounter({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const startTime = performance.now();
    let frameId;

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * ease));
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span>{display}</span>;
}

const ANALYSIS_PHASES = [
  { key: 'initializing', label: 'Querying Dependency Matrix', subtext: 'Inspecting service topology and ingress route graph...', progress: 20 },
  { key: 'scanning', label: 'Scanning Codebase AST', subtext: 'Analyzing downstream component files and callers...', progress: 48 },
  { key: 'tracing', label: 'Tracing Blast Radius', subtext: 'Mapping data pipelines, payload mutations & consumers...', progress: 76 },
  { key: 'calculating', label: 'Calculating Severity Scores', subtext: 'Evaluating breaking runtime failures vs cached fallbacks...', progress: 92 },
  { key: 'completed', label: 'Analysis Complete', subtext: 'Dependency blast radius mapped and synchronized.', progress: 100 }
];

export default function ImpactAnalysisPage() {
  const { 
    setActivePage, 
    selectedEndpointDetail, 
    setSelectedEndpointDetail, 
    addToast, 
    selectedIncidentApi, 
    setSelectedIncidentApi,
    changesData,
    unresolvedCount,
    triggerIncident,
    fetchBackendData,
    isSimulating
  } = useApp();

  // Normalize selected service from context or fallback
  const initialSelection = useMemo(() => {
    if (selectedIncidentApi) {
      if (selectedIncidentApi.includes('User')) return 'User API (Schema Shift)';
      if (selectedIncidentApi.includes('Weather')) return 'Weather API (Latest Change)';
      if (selectedIncidentApi.includes('GitHub')) return 'GitHub API (Header Change)';
      if (selectedIncidentApi.includes('Stripe')) return 'Stripe API (Performance)';
      if (selectedIncidentApi.includes('Product')) return 'Products API (Type Drift)';
      if (selectedIncidentApi.includes('Payment')) return 'Payments API (Semantic Shift)';
      if (selectedIncidentApi.includes('Inventory')) return 'Inventory MCP Service (Param Rename)';
      return `${selectedIncidentApi} (Latest Change)`;
    }
    return 'Weather API (Latest Change)';
  }, [selectedIncidentApi]);

  const [selectedApi, setSelectedApi] = useState(initialSelection);
  const [showGraph, setShowGraph] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'confirmed' | 'inferred' | 'high'

  // 5-Phase Analysis State Machine
  const [analysisPhase, setAnalysisPhase] = useState('completed'); // 'idle' | 'initializing' | 'scanning' | 'tracing' | 'calculating' | 'completed'
  const [analysisProgress, setAnalysisProgress] = useState(100);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timerRef = useRef(null);

  // Sync selected API if context's selectedIncidentApi changes from outside
  useEffect(() => {
    if (selectedIncidentApi) {
      let match = null;
      if (selectedIncidentApi.includes('User')) match = 'User API (Schema Shift)';
      else if (selectedIncidentApi.includes('Weather')) match = 'Weather API (Latest Change)';
      else if (selectedIncidentApi.includes('GitHub')) match = 'GitHub API (Header Change)';
      else if (selectedIncidentApi.includes('Stripe')) match = 'Stripe API (Performance)';
      else if (selectedIncidentApi.includes('Product')) match = 'Products API (Type Drift)';
      else if (selectedIncidentApi.includes('Payment')) match = 'Payments API (Semantic Shift)';
      else if (selectedIncidentApi.includes('Inventory')) match = 'Inventory MCP Service (Param Rename)';
      
      if (match && match !== selectedApi) {
        setSelectedApi(match);
      }
    }
  }, [selectedIncidentApi]);

  // Run live analysis sequence
  const runAnalysisSequence = (targetApi = selectedApi) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisPhase('initializing');
    setAnalysisProgress(20);

    const checkReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepDuration = checkReducedMotion ? 120 : 320;

    let currentStep = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep < ANALYSIS_PHASES.length) {
        const nextPhase = ANALYSIS_PHASES[currentStep];
        setAnalysisPhase(nextPhase.key);
        setAnalysisProgress(nextPhase.progress);
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setAnalysisPhase('completed');
        setAnalysisProgress(100);
        setIsAnalyzing(false);
        addToast(`Blast radius analysis completed for ${targetApi.split(' ')[0]} API.`, 'success', 'Analysis Synchronized');
      }
    }, stepDuration);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Retrieve current impact model
  const currentImpact = useMemo(() => {
    return getImpactAnalysis(selectedApi) || impactAnalysisData;
  }, [selectedApi]);

  const { totalAffected, breakdown, severity, affectedEndpoints } = currentImpact;

  // Calculate blast radius risk gauge score (0 to 100)
  const blastRadiusScore = useMemo(() => {
    if (!severity) return 0;
    const high = (severity.high?.count || 0) * 32;
    const med = (severity.medium?.count || 0) * 16;
    const low = (severity.low?.count || 0) * 8;
    return Math.min(100, high + med + low);
  }, [severity]);

  const riskTier = useMemo(() => {
    if (blastRadiusScore >= 70) return { label: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-500', badgeBg: 'bg-red-50 text-red-700 border-red-200' };
    if (blastRadiusScore >= 40) return { label: 'Moderate Risk', color: 'text-amber-600', bg: 'bg-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }, [blastRadiusScore]);

  // Handle service switch
  const handleServiceChange = (val) => {
    setSelectedApi(val);
    setSelectedNodeId(null);
    let target = 'Weather API';
    if (val.includes('User')) target = 'User API';
    else if (val.includes('Weather')) target = 'Weather API';
    else if (val.includes('GitHub')) target = 'GitHub API';
    else if (val.includes('Stripe')) target = 'Stripe API';
    else if (val.includes('Products') || val.includes('Product')) target = 'Products API';
    else if (val.includes('Payments') || val.includes('Payment')) target = 'Payments API';
    else if (val.includes('Inventory')) target = 'Inventory MCP Service';
    setSelectedIncidentApi(target);
    runAnalysisSequence(val);
  };

  const handleRowClick = (endpoint) => {
    setSelectedNodeId(endpoint.id);
    setSelectedEndpointDetail(endpoint);
  };

  const handleGoToRepair = () => {
    let target = selectedIncidentApi || 'Weather API';
    if (selectedApi.includes('User')) target = 'User API';
    else if (selectedApi.includes('Weather')) target = 'Weather API';
    else if (selectedApi.includes('GitHub')) target = 'GitHub API';
    else if (selectedApi.includes('Stripe')) target = 'Stripe API';
    else if (selectedApi.includes('Products')) target = 'Products API';
    else if (selectedApi.includes('Payments')) target = 'Payments API';
    else if (selectedApi.includes('Inventory')) target = 'Inventory MCP Service';
    setSelectedIncidentApi(target);
    setActivePage('smart-repair');
  };

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    if (!affectedEndpoints) return [];
    if (tableFilter === 'confirmed') return affectedEndpoints.filter(e => e.isConfirmed);
    if (tableFilter === 'inferred') return affectedEndpoints.filter(e => !e.isConfirmed);
    if (tableFilter === 'high') return affectedEndpoints.filter(e => e.impact === 'High');
    return affectedEndpoints;
  }, [affectedEndpoints, tableFilter]);

  // Dynamic graph nodes for the SVG visualizer
  const graphData = useMemo(() => {
    const originName = selectedApi.includes('User API') ? 'User API' 
      : selectedApi.includes('GitHub') ? 'GitHub API' 
      : selectedApi.includes('Stripe') ? 'Stripe API' 
      : selectedApi.includes('Products') ? 'Products API'
      : selectedApi.includes('Payments') ? 'Payments API'
      : selectedApi.includes('Inventory') ? 'Inventory MCP Service'
      : 'Weather API';

    const originDrift = selectedApi.includes('User API') ? 'name → display_name'
      : selectedApi.includes('GitHub') ? 'Header: x-api-version'
      : selectedApi.includes('Stripe') ? 'Latency 480ms'
      : selectedApi.includes('Products') ? 'price: 50 → "50"'
      : selectedApi.includes('Payments') ? 'status: PAID → PROCESSING'
      : selectedApi.includes('Inventory') ? 'sku → item_code'
      : 'temp missing, city renamed';

    const gatewayRoute = selectedApi.includes('User API') ? 'Route: /v1/users/*'
      : selectedApi.includes('GitHub') ? 'Route: /github/*'
      : selectedApi.includes('Stripe') ? 'Route: /billing/*'
      : selectedApi.includes('Products') ? 'Route: /v1/products/*'
      : selectedApi.includes('Payments') ? 'Route: /v1/payments/*'
      : selectedApi.includes('Inventory') ? 'Router: tools/*'
      : 'Route: /weather/*';

    // Map consumers from affectedEndpoints
    const consumers = (affectedEndpoints || []).slice(0, 4).map((ep, idx) => ({
      id: ep.id,
      label: ep.component?.split(',')[0]?.trim() || ep.endpoint,
      impact: ep.impact,
      isConfirmed: ep.isConfirmed,
      description: ep.description,
      service: ep.service,
      endpoint: ep.endpoint,
      yPos: 25 + idx * 62
    }));

    // If fewer than 4 consumers, append an unaffected / healthy downstream node to highlight contrast
    if (consumers.length < 4) {
      consumers.push({
        id: 'node-healthy-cache',
        label: 'System Audit Cache',
        impact: 'Unaffected',
        isConfirmed: false,
        description: 'Read-only fallback pipeline running normally',
        service: 'Infrastructure',
        endpoint: 'GET /internal/health',
        yPos: 25 + consumers.length * 62
      });
    }

    return {
      origin: { name: originName, drift: originDrift },
      gateway: { name: 'API Gateway Ingress', route: gatewayRoute },
      consumers
    };
  }, [selectedApi, affectedEndpoints]);

  // Current active phase metadata
  const currentPhaseMeta = useMemo(() => {
    return ANALYSIS_PHASES.find(p => p.key === analysisPhase) || ANALYSIS_PHASES[4];
  }, [analysisPhase]);

  // Check if system has no active changes
  const isCompletelyHealthy = unresolvedCount === 0 && changesData.length === 0;

  return (
    <div className="space-y-6">
      {/* Header & Service Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Impact Analysis & Blast Radius Engine
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#405CFF]/10 text-[#405CFF] border border-[#405CFF]/20 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#405CFF]" />
              Live AST Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time blast-radius dependency graph tracing broken schemas to affected downstream components.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => runAnalysisSequence()}
            disabled={isAnalyzing}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-subtle ${
              isAnalyzing 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
            title="Re-run blast radius analysis sequence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-[#405CFF]' : 'text-slate-500'}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>

          <div className="relative">
            <select
              value={selectedApi}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 cursor-pointer shadow-subtle"
            >
              <option>Weather API (Latest Change)</option>
              <option>User API (Schema Shift)</option>
              <option>GitHub API (Header Change)</option>
              <option>Stripe API (Performance)</option>
              <option>Products API (Type Drift)</option>
              <option>Payments API (Semantic Shift)</option>
              <option>Inventory MCP Service (Param Rename)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Zero Active Changes Banner (When All Services Healthy) */}
      {isCompletelyHealthy && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                All Monitored Services Healthy — Zero Active Blast Radius
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Every external dependency and internal consumer is running within contract specifications. Viewing historical blast radius models below.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerIncident && triggerIncident('auto')}
            disabled={isSimulating}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5 flex-shrink-0 border border-emerald-300/80 transition-all shadow-subtle"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-700" />
            <span>Simulate API Drift</span>
          </button>
        </div>
      )}

      {/* Live Analysis Progress Bar / Active Scanner Banner */}
      <div className={`rounded-xl border transition-all duration-300 p-3 sm:p-4 ${
        isAnalyzing 
          ? 'bg-[#EEF2FF] border-[#C7D2FE] shadow-subtle' 
          : 'bg-white border-slate-200/90 shadow-card'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isAnalyzing 
                ? 'bg-[#405CFF] text-white animate-pulse' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isAnalyzing ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {currentPhaseMeta.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isAnalyzing 
                    ? 'bg-[#405CFF]/10 text-[#405CFF]' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isAnalyzing ? `Analyzing ${analysisProgress}%` : 'Verified 100%'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentPhaseMeta.subtext}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isAnalyzing ? 'bg-[#405CFF]' : 'bg-emerald-500'
                }`}
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 w-10 text-right">
              {analysisProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Top Cards: Affected Services & Pages (Left 7) & Impact Severity Risk Gauge (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Affected Services & Pages (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Affected Downstream Architecture</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Topology Scan
                </span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {selectedApi.split(' ')[0]} API
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular stat badge: Total Affected with Animated Counter */}
              <div className="w-32 h-32 rounded-full border-4 border-red-500/20 bg-red-50/30 flex flex-col items-center justify-center text-center flex-shrink-0 shadow-inner relative group cursor-default">
                <span className="text-3xl font-black text-red-600 leading-none">
                  <AnimatedCounter value={totalAffected} />
                </span>
                <span className="text-[11px] font-semibold text-slate-600 mt-1">
                  Total Affected
                </span>
                <span className="text-[9px] text-red-500 font-mono mt-0.5">
                  AST Verified
                </span>
              </div>

              {/* Breakdown List */}
              <div className="flex-1 space-y-3.5 w-full">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-700">
                      {item.category === 'Frontend Pages' && <Layout className="w-4 h-4 text-blue-600" />}
                      {item.category === 'Backend Services' && <Server className="w-4 h-4 text-indigo-600" />}
                      {item.category === 'External Integrations' && <Share2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{item.category}</span>
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                          <AnimatedCounter value={item.count} />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.examples}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dependency Depth: <strong className="text-slate-800">2 Hops</strong></span>
            <span>AST Parse Time: <strong className="text-slate-800">14ms</strong></span>
          </div>
        </div>

        {/* Impact Severity & Blast Radius Risk Gauge (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Blast Radius Risk Score
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskTier.badgeBg}`}>
                {riskTier.label} ({blastRadiusScore}/100)
              </span>
            </div>

            {/* Visual Risk Gauge Meter */}
            <div className="mb-5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Calculated Impact Index</span>
                <span className={`font-mono ${riskTier.color}`}>{blastRadiusScore}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full ${riskTier.bg} transition-all duration-700 ease-out`}
                  style={{ width: `${blastRadiusScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Safe (0)</span>
                <span>Moderate (50)</span>
                <span>Critical (100)</span>
              </div>
            </div>

            {/* Severity Bars with Animated Numbers */}
            <div className="space-y-3.5">
              {/* High */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    High Severity
                  </span>
                  <span className="text-slate-800 font-bold font-mono">
                    <AnimatedCounter value={severity.high.count} /> components ({severity.high.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${severity.high.percentage}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Medium Severity
                  </span>
                  <span className="text-slate-800 font-bold font-mono">
                    <AnimatedCounter value={severity.medium.count} /> components ({severity.medium.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${severity.medium.percentage}%` }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Low Severity
                  </span>
                  <span className="text-slate-800 font-bold font-mono">
                    <AnimatedCounter value={severity.low.count} /> components ({severity.low.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${severity.low.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Autonomous repair synthesis</span>
            <button
              onClick={handleGoToRepair}
              className="text-xs font-semibold text-[#405CFF] hover:underline flex items-center gap-1 group"
            >
              <span>Fix with Smart Repair</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Dependency Blast-Radius Graph Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Blast-Radius Topology Graph
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Multi-Tier SVG Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any consumer node to inspect stack trace, AST dependency linkage, or jump to smart repair.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedNodeId && (
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100"
              >
                Clear Node Selection
              </button>
            )}
            <button 
              onClick={() => setShowGraph(!showGraph)}
              className="text-xs font-semibold text-[#405CFF] hover:underline"
            >
              {showGraph ? 'Collapse Graph' : 'Expand Graph'}
            </button>
          </div>
        </div>

        {showGraph && (
          <div className="p-4 sm:p-6 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto relative shadow-inner">
            {/* Live Radar Scan Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-xl">
              <div className="w-full h-full animate-radar-scan bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
            </div>

            <div className="min-w-[840px]">
              <svg 
                viewBox="0 0 880 270" 
                className="w-full h-[270px] select-none"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                  </linearGradient>
                  
                  {/* Arrow Markers */}
                  <marker id="arrow-broken" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 0 0 L 8 4 L 0 8 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 0 0 L 8 4 L 0 8 z" fill="#F59E0B" />
                  </marker>
                  <marker id="arrow-healthy" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 0 0 L 8 4 L 0 8 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* --- CONNECTING FLOW LINES --- */}
                
                {/* 1. Origin -> Gateway Connection */}
                <path
                  d="M 210 135 C 265 135, 265 135, 310 135"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="graph-flow-line-broken"
                  markerEnd="url(#arrow-broken)"
                />
                <text x="260" y="125" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                  Payload Drift
                </text>

                {/* 2. Gateway -> Consumer Connections */}
                {graphData.consumers.map((consumer) => {
                  const isBroken = consumer.impact === 'High';
                  const isMedium = consumer.impact === 'Medium';
                  const strokeColor = isBroken ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981';
                  const markerId = isBroken ? 'url(#arrow-broken)' : isMedium ? 'url(#arrow-amber)' : 'url(#arrow-healthy)';
                  const flowClass = isBroken ? 'graph-flow-line-broken' : isMedium ? 'graph-flow-line-broken' : 'graph-flow-line';
                  const isNodeSelected = selectedNodeId === consumer.id || hoveredNodeId === consumer.id;

                  return (
                    <g key={`flow-${consumer.id}`}>
                      <path
                        d={`M 480 135 C 545 135, 545 ${consumer.yPos + 22}, 610 ${consumer.yPos + 22}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isNodeSelected ? 3.5 : 2}
                        strokeDasharray="6 4"
                        className={flowClass}
                        markerEnd={markerId}
                        opacity={isNodeSelected ? 1 : 0.85}
                      />
                    </g>
                  );
                })}

                {/* --- TIER 1: ORIGIN NODE --- */}
                <g 
                  transform="translate(20, 95)"
                  className="cursor-pointer"
                  onClick={() => addToast(`Origin: ${graphData.origin.name} (${graphData.origin.drift})`, 'info', 'Drift Source')}
                >
                  <rect
                    width="190"
                    height="80"
                    rx="12"
                    fill="#1E293B"
                    stroke="#EF4444"
                    strokeWidth="2"
                    className="node-alert-glow"
                  />
                  {/* Origin Radar Pulse Dot */}
                  <circle cx="20" cy="24" r="5" fill="#EF4444" className="animate-ping" opacity="0.6" />
                  <circle cx="20" cy="24" r="4" fill="#EF4444" />
                  <text x="32" y="27" fill="#F87171" fontSize="10" fontWeight="bold" letterSpacing="0.5">
                    ORIGIN DRIFT
                  </text>
                  <text x="20" y="47" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                    {graphData.origin.name}
                  </text>
                  <text x="20" y="64" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                    {graphData.origin.drift}
                  </text>
                </g>

                {/* --- TIER 2: INGRESS GATEWAY NODE --- */}
                <g 
                  transform="translate(310, 95)"
                  className="cursor-pointer"
                  onClick={() => addToast('API Gateway route matching active drift', 'info', 'Ingress Router')}
                >
                  <rect
                    width="170"
                    height="80"
                    rx="12"
                    fill="#1E293B"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                  <rect x="14" y="16" width="6" height="6" rx="2" fill="#818CF8" />
                  <text x="26" y="23" fill="#A5B4FC" fontSize="10" fontWeight="bold" letterSpacing="0.5">
                    INGRESS ROUTER
                  </text>
                  <text x="14" y="45" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                    API Gateway
                  </text>
                  <text x="14" y="63" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                    {graphData.gateway.route}
                  </text>
                </g>

                {/* --- TIER 3: CONSUMER NODES --- */}
                {graphData.consumers.map((consumer) => {
                  const isSelected = selectedNodeId === consumer.id;
                  const isHovered = hoveredNodeId === consumer.id;
                  const isBroken = consumer.impact === 'High';
                  const isMedium = consumer.impact === 'Medium';
                  const strokeColor = isBroken ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981';
                  const badgeFill = isBroken ? '#7F1D1D' : isMedium ? '#78350F' : '#064E3B';
                  const badgeText = isBroken ? '#FCA5A5' : isMedium ? '#FDE68A' : '#A7F3D0';

                  return (
                    <g
                      key={consumer.id}
                      transform={`translate(610, ${consumer.yPos})`}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedNodeId(consumer.id);
                        const matchedEp = affectedEndpoints?.find(e => e.id === consumer.id);
                        if (matchedEp) {
                          setSelectedEndpointDetail(matchedEp);
                        } else {
                          setSelectedEndpointDetail({
                            id: consumer.id,
                            endpoint: consumer.endpoint,
                            service: consumer.service,
                            impact: consumer.impact,
                            impactClass: isBroken ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
                            description: consumer.description,
                            component: consumer.label,
                            details: `Direct topological dependency linked via ${consumer.service}.`,
                            lineNum: `${consumer.label}:1`,
                            isConfirmed: consumer.isConfirmed
                          });
                        }
                      }}
                      onMouseEnter={() => setHoveredNodeId(consumer.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <rect
                        width="245"
                        height="48"
                        rx="10"
                        fill={isSelected ? '#0F172A' : isHovered ? '#1E293B' : '#0F172A'}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                        className={isSelected ? 'node-alert-glow' : ''}
                      />
                      
                      {/* Component Label */}
                      <text x="14" y="23" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                        {consumer.label}
                      </text>
                      
                      {/* Endpoint Subtitle */}
                      <text x="14" y="38" fill="#94A3B8" fontSize="9.5" fontFamily="monospace">
                        {consumer.endpoint || consumer.service}
                      </text>

                      {/* Severity Pill Badge */}
                      <rect 
                        x="170" 
                        y="10" 
                        width="65" 
                        height="18" 
                        rx="9" 
                        fill={badgeFill} 
                      />
                      <text 
                        x="202" 
                        y="23" 
                        textAnchor="middle" 
                        fill={badgeText} 
                        fontSize="9" 
                        fontWeight="bold"
                      >
                        {consumer.impact}
                      </text>

                      {/* AST Confirmed Dot */}
                      {consumer.isConfirmed && (
                        <circle cx="158" cy="19" r="3.5" fill="#C084FC" title="AST Confirmed Break" />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive Legend Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-slate-200 font-semibold">Origin Drift</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>Ingress Gateway</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span>High Impact (Breaking)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>Medium Impact (Inferred)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Unaffected</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>AST Confirmed</span>
                </span>
              </div>

              <span className="text-slate-400 font-mono text-[10px]">
                Showing 1 Origin → 1 Gateway → {graphData.consumers.length} Consumers
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Affected Endpoints Table Card with Evidence Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Downstream Impact Endpoints</span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {filteredEndpoints.length} of {affectedEndpoints.length} Endpoints
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any endpoint to highlight its position in the topology and view AST code references.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTableFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                tableFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({affectedEndpoints.length})
            </button>
            <button
              onClick={() => setTableFilter('confirmed')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                tableFilter === 'confirmed' 
                  ? 'bg-white text-purple-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmed AST
            </button>
            <button
              onClick={() => setTableFilter('inferred')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                tableFilter === 'inferred' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inferred
            </button>
            <button
              onClick={() => setTableFilter('high')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                tableFilter === 'high' 
                  ? 'bg-white text-red-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evidence</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEndpoints.map((ep) => {
                const isSelected = selectedNodeId === ep.id;

                return (
                  <tr 
                    key={ep.id}
                    onClick={() => handleRowClick(ep)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected 
                        ? 'bg-[#EEF2FF] hover:bg-[#E0E7FF]' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-slate-900 group-hover:text-[#405CFF] transition-colors">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#405CFF]"></span>
                        )}
                        <span>{ep.endpoint}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{ep.service}</td>
                    <td className="py-3.5 px-4">
                      {ep.isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Confirmed AST Break
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Info className="w-3 h-3 text-blue-600" />
                          Inferred Flow
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ep.impactClass}`}>
                        {ep.impact}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <div>
                        <span>{ep.description}</span>
                        {ep.component && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {ep.component}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-all inline ${
                        isSelected ? 'text-[#405CFF]' : 'text-slate-400 group-hover:text-slate-700'
                      }`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Endpoint Drawer / Slide-Over Modal */}
      {selectedEndpointDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedEndpointDetail(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedEndpointDetail.endpoint}</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Service Layer: {selectedEndpointDetail.service}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEndpointDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Impact Severity</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedEndpointDetail.impactClass}`}>
                    {selectedEndpointDetail.impact} Priority
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Analysis Evidence</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedEndpointDetail.isConfirmed 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {selectedEndpointDetail.isConfirmed ? 'Confirmed Direct AST Break' : 'Inferred Downstream Consumer'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Root Cause Description</span>
                <p className="text-xs text-slate-800 font-medium mt-1">
                  {selectedEndpointDetail.description}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedEndpointDetail.details}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Impacted Code Location</span>
                <div className="mt-1 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs flex items-center justify-between">
                  <span>{selectedEndpointDetail.lineNum || selectedEndpointDetail.component}</span>
                  <span className="text-[10px] text-slate-400">AST Reference</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setSelectedEndpointDetail(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedEndpointDetail(null);
                  handleGoToRepair();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg flex items-center gap-1.5 shadow-subtle transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open in Smart Repair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
