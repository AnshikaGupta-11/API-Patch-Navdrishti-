import React, { useState } from 'react';
import { 
  Box, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { uptimeSeriesData } from '../data/mockData';

export default function DashboardPage() {
  const { 
    apis, 
    activities, 
    setActivePage, 
    setSelectedApiForDetails, 
    setIsApiDetailsOpen,
    searchQuery,
    repairState,
    selectedIncidentApi,
    setIsLogsModalOpen,
    backendConnected,
    proxyResponse,
    apisWithChangesCount: ctxApisWithChanges,
    healthyApisCount: ctxHealthyApis,
    totalApisCount: ctxTotalApis
  } = useApp();

  const [showCharts, setShowCharts] = useState(true);

  // Filtered APIs if searching on dashboard
  const displayApis = apis.filter(api => 
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalApisCount = ctxTotalApis ?? apis.length;
  const apisWithChangesCount = ctxApisWithChanges ?? apis.filter(a => a.status === 'Changed').length;
  const healthyApisCount = ctxHealthyApis ?? Math.max(0, totalApisCount - apisWithChangesCount);
  const healthyPercent = totalApisCount > 0 ? ((healthyApisCount / totalApisCount) * 100).toFixed(1) : '100.0';
  const changesPercent = totalApisCount > 0 ? ((apisWithChangesCount / totalApisCount) * 100).toFixed(1) : '0.0';
  
  // Calculate avg response time
  const avgResponseTime = Math.round(
    apis.reduce((acc, a) => acc + (a.latencyNum || 200), 0) / (apis.length || 1)
  );

  // Status donut chart data
  const statusDistribution = [
    { name: 'Healthy', value: healthyApisCount, color: '#10B981' },
    { name: 'Warning / Changed', value: apisWithChangesCount, color: '#EF4444' },
    { name: 'Down', value: 0, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Good Morning, Chinmay <span className="inline-block animate-pulse">👋</span>
            </h2>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              backendConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {backendConnected ? 'Express Backend Live (:3001)' : 'Local Sandbox Connected'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            API Patch — Keep software working when APIs change.
          </p>
        </div>

        <div className="text-right sm:self-center">
          <span className="text-xs font-semibold text-slate-700 block">Oct 11, 2026</span>
          <span className="text-[11px] text-slate-400 block font-mono">10:45 AM EST</span>
        </div>
      </div>

      {/* Multi-Dependency Sandbox Banner */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#405CFF] flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Deterministic Multi-Dependency Sandbox Active</span>
            <span className="text-[11px] text-slate-500 block">
              REST APIs • SDK Adapter (v1/v2) • Official MCP Server (`@modelcontextprotocol/sdk`) • Webhook Event Receiver (HMAC & Idempotent)
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[#405CFF] border border-indigo-200 text-[10px] font-mono font-semibold">
            MCP: /mcp (Streamable HTTP)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold">
            Webhooks: /api/webhooks/receiver
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
            Gateway: /api/proxy/:id
          </span>
        </div>
      </div>

      {/* Workflow Step 8: Change Resolved Dashboard Banner */}
      {repairState === 'applied' && (
        <div className="bg-emerald-50 border-2 border-emerald-400/40 rounded-2xl p-5 shadow-card animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Change Resolved & System Recovered</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Recovered
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Service: <strong>{selectedIncidentApi}</strong> • Change: <strong>{selectedIncidentApi === 'User API' ? 'name → display_name' : 'temp → temperature'}</strong> • Impact: <strong>{selectedIncidentApi === 'User API' ? 'User Profile, Welcome Message' : 'WeatherCard, CitySearch'}</strong> • Fix: <strong>Applied (adapter)</strong> • Tests: <strong className="text-emerald-700">Passed ✓</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle transition-colors"
              >
                View Logs
              </button>
              <button
                onClick={() => setActivePage('validation-recovery')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D3B70] hover:bg-[#152B52] rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                Validation Suite →
              </button>
            </div>
          </div>

          {/* Step 11 Proxy Response Preview */}
          <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/90 font-mono text-[11px] text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
            <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Verified Gateway Proxy (Step 11): <code>GET /api/proxy/weather</code> &rarr; {JSON.stringify(proxyResponse || { temp: 24, city: "Indore", condition: "Sunny" })}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold self-start sm:self-auto">
              200 OK — Normalized
            </span>
          </div>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total APIs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Total APIs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalApisCount}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <span>+1 since last 24h</span>
          </p>
        </div>

        {/* APIs with Changes */}
        <div 
          onClick={() => setActivePage('change-detection')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 group-hover:text-red-600 transition-colors">APIs with Changes</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{apisWithChangesCount}</span>
          </div>
          <p className={`text-[11px] font-medium mt-1.5 ${apisWithChangesCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
            {apisWithChangesCount > 0 ? 'Requires attention' : 'All systems normal'}
          </p>
        </div>

        {/* Healthy APIs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Healthy APIs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{healthyApisCount}</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1.5">
            {healthyPercent}% uptime
          </p>
        </div>

        {/* Avg. Response Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Avg. Response Time</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{avgResponseTime} ms</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1.5">
            -12% improvement
          </p>
        </div>
      </div>

      {/* Main Grid: Monitored APIs & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitored APIs Table (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden flex flex-col">
          <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monitored APIs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live latency and schema integrity status</p>
            </div>
            <button 
              onClick={() => setActivePage('apis')}
              className="text-xs font-semibold text-[#405CFF] hover:text-[#334CE0] flex items-center gap-1 transition-colors"
            >
              View all ({apis.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">API Name</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uptime</th>
                  <th className="py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Response Time</th>
                  <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayApis.slice(0, 5).map((api) => (
                  <tr 
                    key={api.id}
                    onClick={() => {
                      setSelectedApiForDetails(api);
                      setIsApiDetailsOpen(true);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800 group-hover:text-[#405CFF] transition-colors flex items-center gap-2">
                      <span>{api.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        api.status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${api.status === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {api.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{api.uptime}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{api.responseTime}</td>
                    <td className="py-3 px-4 text-slate-400 text-right text-[11px]">{api.lastChecked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
            <button
              onClick={() => setActivePage('apis')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Explore and filter full API catalog →
            </button>
          </div>
        </div>

        {/* Recent Activity (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col">
          <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time contract & telemetry feed</p>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Live</span>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {activities.map((item, idx) => (
              <div 
                key={item.id || `act-${idx}`} 
                onClick={() => {
                  if (item.type === 'changed') setActivePage('change-detection');
                }}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: item.dotColor || '#3B82F6' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-[#405CFF] transition-colors truncate">
                      {item.apiName} <span className="font-normal text-slate-500">{item.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{item.timeAgo}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Autonomous listener enabled</span>
            <button
              onClick={() => setActivePage('change-detection')}
              className="text-xs font-semibold text-[#405CFF] hover:underline"
            >
              Analyze changes →
            </button>
          </div>
        </div>
      </div>

      {/* Extra Telemetry: 24h Uptime Chart & Status Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">API Telemetry & Uptime Trend</h3>
            <p className="text-xs text-slate-500">Average round-trip response time over the last 24 hours</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium">
            Last 24 Hours
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Latency Area Chart */}
          <div className="lg:col-span-8 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uptimeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#405CFF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#405CFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[150, 320]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B172A', borderColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} ms`, 'Response Time']}
                />
                <Area type="monotone" dataKey="latency" stroke="#405CFF" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Donut Summary */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={45}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900">{totalApisCount}</span>
                <span className="text-[10px] text-slate-400 font-medium">Total APIs</span>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 w-full text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Healthy APIs
                </span>
                <span className="font-semibold text-slate-800">{healthyApisCount} ({healthyPercent}%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Requires Attention
                </span>
                <span className="font-semibold text-slate-800">{apisWithChangesCount} ({changesPercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
