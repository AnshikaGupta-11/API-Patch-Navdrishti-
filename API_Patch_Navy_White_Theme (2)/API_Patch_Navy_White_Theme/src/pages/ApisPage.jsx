import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApisPage() {
  const { 
    apis, 
    setIsAddApiOpen, 
    setSelectedApiForDetails, 
    setIsApiDetailsOpen, 
    addToast,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  React.useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const effectiveQuery = localSearch || searchQuery || '';

  const filteredApis = apis.filter(api => {
    const matchesSearch = 
      api.name.toLowerCase().includes(effectiveQuery.toLowerCase()) ||
      api.endpoint.toLowerCase().includes(effectiveQuery.toLowerCase()) ||
      (api.category && api.category.toLowerCase().includes(effectiveQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || api.status === statusFilter;
    const matchesEnv = envFilter === 'ALL' || api.env === envFilter;

    return matchesSearch && matchesStatus && matchesEnv;
  });

  const handleCopy = (id, endpoint, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    addToast('Endpoint URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInspect = (api, e) => {
    e.stopPropagation();
    setSelectedApiForDetails(api);
    setIsApiDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Monitored APIs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying live contract contracts, response latency, and uptime health.
          </p>
        </div>

        <button
          onClick={() => setIsAddApiOpen(true)}
          className="px-4 py-2 bg-[#405CFF] hover:bg-[#334CE0] text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add API
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] text-slate-500 font-medium">Total Registered</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{apis.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] text-slate-500 font-medium">Production Services</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{apis.filter(a => a.env === 'Production').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] text-slate-500 font-medium">Healthy Endpoints</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{apis.filter(a => a.status === 'Healthy').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] text-slate-500 font-medium">Flagged for Review</span>
          <p className="text-xl font-bold text-red-600 mt-1">{apis.filter(a => a.status === 'Changed').length}</p>
        </div>
      </div>

      {/* Table Container with Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by API name or endpoint..."
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 focus:border-[#405CFF]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Changed">Changed / Warning</option>
            </select>

            {/* Env Filter */}
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30"
            >
              <option value="ALL">All Environments</option>
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">API Name</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uptime</th>
                <th className="py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Latency</th>
                <th className="py-3 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Environment</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredApis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No APIs found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredApis.map((api) => (
                  <tr
                    key={api.id}
                    onClick={(e) => handleInspect(api, e)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-[#405CFF] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#405CFF] transition-colors"></span>
                        <div>
                          <span>{api.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{api.category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                          {api.method || 'GET'}
                        </span>
                        <span className="truncate">{api.endpoint}</span>
                        <button
                          onClick={(e) => handleCopy(api.id, api.endpoint, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                          title="Copy Endpoint"
                        >
                          {copiedId === api.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        api.status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${api.status === 'Healthy' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {api.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 font-medium">{api.uptime}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{api.responseTime}</td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {api.env}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => handleInspect(api, e)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#405CFF] hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredApis.length} of {apis.length} monitored endpoints</span>
          <span className="text-[11px] text-slate-400">Automatic background polling active (60s)</span>
        </div>
      </div>
    </div>
  );
}
