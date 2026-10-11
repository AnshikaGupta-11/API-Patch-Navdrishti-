import React, { useState } from 'react';
import { X, Terminal, CheckCircle2, Copy, Check, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LogsModal() {
  const { isLogsModalOpen, setIsLogsModalOpen, addToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isLogsModalOpen) return null;

  const logs = `[2026-10-10 10:24:01.002] INFO  [suite:runner] Initializing autonomous API validation suite...
[2026-10-10 10:24:01.045] INFO  [test:schema] Checking contract for GET https://api.weather.com/v1/current
[2026-10-10 10:24:01.088] PASS  [test:schema] Key assertion satisfied: 'temperature' [Float64] (value: 24)
[2026-10-10 10:24:01.089] PASS  [test:schema] Key assertion satisfied: 'city_name' [String] (value: 'Indore')
[2026-10-10 10:24:01.120] PASS  [test:integrity] Strict schema validator passed (0 errors, 0 deprecations)
[2026-10-10 10:24:01.230] INFO  [test:downstream] Pinging dependent consumer: WeatherDashboard (Frontend)
[2026-10-10 10:24:01.278] PASS  [test:downstream] WeatherDashboard rendered 100% components without null pointer
[2026-10-10 10:24:01.310] INFO  [test:downstream] Pinging dependent consumer: NotificationWorker (Backend)
[2026-10-10 10:24:01.350] PASS  [test:downstream] NotificationWorker parsed condition payloads successfully
[2026-10-10 10:24:01.425] PASS  [test:e2e] End-to-end integration pipeline validated across 3 microservices
[2026-10-10 10:24:01.499] PASS  [test:perf] Benchmark 100 iterations: p50=210ms, p95=248ms, p99=272ms (<300ms SLA)
[2026-10-10 10:24:01.500] SUCCESS [suite:complete] 5/5 validation suites passed. System status: STABLE.`;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    addToast('Logs copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Validation Execution Stream</h3>
              <p className="text-xs text-slate-500">Real-time assertions and sandbox run logs</p>
            </div>
          </div>
          <button
            onClick={() => setIsLogsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Box */}
        <div className="p-4 bg-[#050D1B] flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300">
          <pre className="whitespace-pre-wrap">{logs}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Zero Failures Detected
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Logs'}
            </button>
            <button
              onClick={() => setIsLogsModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
