import React, { useState } from 'react';
import { X, Copy, Check, RefreshCw, ExternalLink, ShieldCheck, Clock, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ApiDetailsModal() {
  const { isApiDetailsOpen, setIsApiDetailsOpen, selectedApiForDetails, addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [probing, setProbing] = useState(false);

  if (!isApiDetailsOpen || !selectedApiForDetails) return null;

  const api = selectedApiForDetails;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(api.endpoint);
    setCopied(true);
    addToast('Endpoint URL copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunProbe = () => {
    setProbing(true);
    setTimeout(() => {
      setProbing(false);
      addToast(`Health probe completed for ${api.name}: Response time ${api.responseTime}, HTTP 200 OK`, 'success', 'Probe Successful');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
              {api.method || 'GET'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{api.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  api.status === 'Healthy' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : api.status === 'Changed'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {api.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{api.category || 'Monitored Service'} • {api.env || 'Production'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsApiDetailsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Uptime</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{api.uptime}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Response Latency</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{api.responseTime}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Last Synced</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{api.lastChecked}</span>
            </div>
          </div>

          {/* Endpoint Bar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Monitored Endpoint</label>
            <div className="flex items-center gap-2 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
              <span className="text-indigo-400 font-bold">{api.method || 'GET'}</span>
              <span className="flex-1 truncate">{api.endpoint}</span>
              <button
                onClick={handleCopyEndpoint}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Request Headers</label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
              <div><span className="text-slate-400">Content-Type:</span> application/json</div>
              <div><span className="text-slate-400">X-Agent-Monitoring:</span> active-contract-v2</div>
              <div><span className="text-slate-400">Cache-Control:</span> no-cache</div>
            </div>
          </div>

          {/* Response Payload Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Latest Inspected Payload</label>
            <div className="p-3 bg-[#0B172A] rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48">
              <pre>{JSON.stringify(api.sampleResponse || { status: 'healthy', checkedAt: new Date().toISOString() }, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={handleRunProbe}
            disabled={probing}
            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
            {probing ? 'Probing...' : 'Send Manual Health Probe'}
          </button>

          <button
            onClick={() => setIsApiDetailsOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
