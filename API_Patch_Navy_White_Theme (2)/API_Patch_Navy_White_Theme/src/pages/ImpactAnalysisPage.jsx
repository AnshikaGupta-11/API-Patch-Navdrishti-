import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { impactAnalysisData, impactAnalysisMap } from '../data/mockData';

export default function ImpactAnalysisPage() {
  const { setActivePage, selectedEndpointDetail, setSelectedEndpointDetail, addToast, selectedIncidentApi, setSelectedIncidentApi } = useApp();
  
  const initialSelection = selectedIncidentApi === 'User API' 
    ? 'User API (Schema Shift)' 
    : 'Weather API (Latest Change)';
  
  const [selectedApi, setSelectedApi] = useState(initialSelection);
  const [showGraph, setShowGraph] = useState(true);

  const currentImpact = (impactAnalysisMap && impactAnalysisMap[selectedApi]) || impactAnalysisData;
  const { totalAffected, breakdown, severity, affectedEndpoints } = currentImpact;

  const handleRowClick = (endpoint) => {
    setSelectedEndpointDetail(endpoint);
  };

  const handleGoToRepair = () => {
    if (selectedApi.includes('User API')) {
      setSelectedIncidentApi('User API');
    } else {
      setSelectedIncidentApi('Weather API');
    }
    setActivePage('smart-repair');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Impact Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            See which services, pages and features are affected by API changes.
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <select
            value={selectedApi}
            onChange={(e) => {
              setSelectedApi(e.target.value);
              if (e.target.value.includes('User API')) {
                setSelectedIncidentApi('User API');
              } else if (e.target.value.includes('Weather API')) {
                setSelectedIncidentApi('Weather API');
              }
            }}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 cursor-pointer shadow-subtle"
          >
            <option>Weather API (Latest Change)</option>
            <option>User API (Schema Shift)</option>
            <option>GitHub API (Header Change)</option>
            <option>Stripe API (Performance)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Top 2 Cards: Affected Services & Pages (Left) & Impact Severity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Affected Services & Pages (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5">
            Affected Services & Pages
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular stat badge: 6 Total Affected */}
            <div className="w-32 h-32 rounded-full border-4 border-red-500/20 bg-red-50/30 flex flex-col items-center justify-center text-center flex-shrink-0 shadow-inner relative">
              <span className="text-3xl font-black text-red-600 leading-none">
                {totalAffected}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-1">
                Total Affected
              </span>
            </div>

            {/* Breakdown List */}
            <div className="flex-1 space-y-3.5 w-full">
              {breakdown.map((item, idx) => {
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.category === 'Frontend Pages' && <Layout className="w-4 h-4 text-blue-600" />}
                      {item.category === 'Backend Services' && <Server className="w-4 h-4 text-indigo-600" />}
                      {item.category === 'External Integrations' && <Share2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{item.category}</span>
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.examples}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Severity (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-5">
            Impact Severity
          </h3>

          <div className="space-y-4">
            {/* High */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-red-600">High</span>
                <span className="text-slate-800 font-bold">{severity.high.count}</span>
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
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-amber-600">Medium</span>
                <span className="text-slate-800 font-bold">{severity.medium.count}</span>
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
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-600">Low</span>
                <span className="text-slate-800 font-bold">{severity.low.count}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${severity.low.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Autonomous repair available</span>
            <button
              onClick={handleGoToRepair}
              className="text-xs font-semibold text-[#405CFF] hover:underline flex items-center gap-1"
            >
              Fix with Smart Repair →
            </button>
          </div>
        </div>
      </div>

      {/* Dependency Graph Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dependency Graph</h3>
            <p className="text-xs text-slate-500">Live service topology tracing downstream schema consumers</p>
          </div>
          <button 
            onClick={() => setShowGraph(!showGraph)}
            className="text-xs font-semibold text-[#405CFF] hover:underline"
          >
            {showGraph ? 'Collapse Graph' : 'Expand Graph'}
          </button>
        </div>

        {showGraph && (
          <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-x-auto">
            <div className="min-w-[680px] flex items-center justify-between gap-4">
              {/* Node 1: Origin API */}
              <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl text-center w-48 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-red-600 block">Origin Event</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">
                  {selectedApi.includes('User API') ? 'User API' : selectedApi.includes('GitHub') ? 'GitHub API' : selectedApi.includes('Stripe') ? 'Stripe API' : 'Weather API'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {selectedApi.includes('User API') ? 'v1/users (name shift)' : selectedApi.includes('GitHub') ? 'v1/repos (header added)' : selectedApi.includes('Stripe') ? 'payment_intents (480ms)' : 'v1/current (2 fields)'}
                </span>
              </div>

              {/* Arrow Connector */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] font-mono font-medium text-slate-500 mb-1">Payload Pipeline</span>
                <div className="w-full h-0.5 bg-red-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-red-400 rotate-45"></div>
                </div>
              </div>

              {/* Node 2: Gateway Layer */}
              <div className="p-3.5 bg-white border border-slate-300 rounded-xl text-center w-44 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Ingress</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block">API Gateway</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {selectedApi.includes('User API') ? 'Route: /v1/users/*' : selectedApi.includes('GitHub') ? 'Route: /github/*' : selectedApi.includes('Stripe') ? 'Route: /billing/*' : 'Route: /weather/*'}
                </span>
              </div>

              {/* Arrow Connector */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] font-mono font-medium text-slate-500 mb-1">Fan-out ({totalAffected} services)</span>
                <div className="w-full h-0.5 bg-slate-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-slate-400 rotate-45"></div>
                </div>
              </div>

              {/* Node 3: Consumers Cluster */}
              <div className="space-y-2 w-52">
                {selectedApi.includes('User API') ? (
                  <>
                    <div className="p-2 bg-red-100/70 border border-red-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>UserProfile.jsx</span>
                      <span className="text-[10px] font-bold text-red-600">High</span>
                    </div>
                    <div className="p-2 bg-red-100/70 border border-red-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>WelcomeMessage.jsx</span>
                      <span className="text-[10px] font-bold text-red-600">High</span>
                    </div>
                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>Account Settings</span>
                      <span className="text-[10px] font-bold text-emerald-700">Unaffected</span>
                    </div>
                  </>
                ) : selectedApi.includes('GitHub') ? (
                  <>
                    <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>GithubAdapter.ts</span>
                      <span className="text-[10px] font-bold text-amber-700">Medium</span>
                    </div>
                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>OrgSelector.jsx</span>
                      <span className="text-[10px] font-bold text-emerald-700">Low</span>
                    </div>
                  </>
                ) : selectedApi.includes('Stripe') ? (
                  <>
                    <div className="p-2 bg-red-100/70 border border-red-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>CheckoutForm.jsx</span>
                      <span className="text-[10px] font-bold text-red-600">High</span>
                    </div>
                    <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>InvoiceWorker.ts</span>
                      <span className="text-[10px] font-bold text-amber-700">Medium</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-red-100/70 border border-red-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>WeatherCard UI</span>
                      <span className="text-[10px] font-bold text-red-600">High</span>
                    </div>
                    <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>CitySearch Page</span>
                      <span className="text-[10px] font-bold text-amber-700">Medium</span>
                    </div>
                    <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>Notification Service</span>
                      <span className="text-[10px] font-bold text-amber-700">Medium</span>
                    </div>
                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                      <span>Mobile App Cache</span>
                      <span className="text-[10px] font-bold text-emerald-700">Low</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Affected Endpoints Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Affected Endpoints</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any endpoint to inspect impacted component files and stack trace</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {affectedEndpoints.length} Endpoints
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Impact</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {affectedEndpoints.map((ep) => (
                <tr 
                  key={ep.id}
                  onClick={() => handleRowClick(ep)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-slate-900 group-hover:text-[#405CFF] transition-colors">
                    {ep.endpoint}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{ep.service}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ep.impactClass}`}>
                      {ep.impact}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">{ep.description}</td>
                  <td className="py-3.5 px-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Endpoint Drawer / Slide-Over Modal */}
      {selectedEndpointDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
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

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Impact Severity</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedEndpointDetail.impactClass}`}>
                  {selectedEndpointDetail.impact} Priority
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Root Cause Description</span>
                <p className="text-xs text-slate-800 font-medium mt-1">
                  {selectedEndpointDetail.description}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedEndpointDetail.details}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Impacted Code Location</span>
                <div className="mt-1 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs">
                  {selectedEndpointDetail.lineNum}
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
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open in Smart Repair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
