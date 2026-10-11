import React from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  Play, 
  Check, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ValidationRecoveryPage() {
  const { 
    validationState, 
    validationTests, 
    runValidationTests, 
    setIsLogsModalOpen, 
    setIsRollbackModalOpen,
    repairState,
    selectedIncidentApi,
    setActivePage,
    proxyResponse,
    isApplyingFix
  } = useApp();

  const isAllPassed = validationState === 'passed';
  const isRunning = validationState === 'running';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Validation & Recovery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Run tests to ensure the fix works and recover if needed.
          </p>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
            isAllPassed 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : isRunning
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Tests Running...
              </>
            ) : isAllPassed ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                All Tests Passed
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Validation Required
              </>
            )}
          </span>
        </div>
      </div>

      {/* Card 1: Validation Tests List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">
            Validation Tests
          </h3>
          <button
            onClick={runValidationTests}
            disabled={isRunning}
            className="px-3 py-1.5 text-xs font-semibold text-[#405CFF] hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? 'Running Suite...' : 'Re-run Tests'}
          </button>
        </div>

        <div className="space-y-2.5">
          {(validationTests || []).map((test, idx) => {
            const passed = test?.status === 'Passed';
            const running = test?.status === 'Running...';

            return (
              <div
                key={test.id || (`vt-${idx}`)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {running ? (
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {test.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal block sm:hidden">
                      {test.details}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {test.duration}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    passed
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Resolution Status or Recovery State */}
      {repairState === 'rolled_back' ? (
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/90 shadow-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 shadow-sm">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rollback Active
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                The autonomous fix was safely reverted. Pre-repair schema baseline is active for <strong>{selectedIncidentApi}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => setActivePage('smart-repair')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              Re-open Smart Repair →
            </button>
          </div>
        </div>
      ) : repairState === 'applied' && isAllPassed ? (
        <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/90 shadow-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Issue Resolved!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                The API has been successfully repaired and all 5 verification tests passed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => setIsLogsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              View Logs
            </button>

            <button
              onClick={() => setIsRollbackModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0B172A] hover:bg-[#13284A] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              Rollback (if needed)
            </button>
          </div>
        </div>
      ) : validationState === 'failed' ? (
        <div className="bg-red-50/50 rounded-2xl border border-red-200/90 shadow-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700 flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Validation Failed: Regression Detected
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                One or more validation checks failed against {selectedIncidentApi}. Inspect the failure details or adjust the adapter code.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={runValidationTests}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run Suite
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50/40 rounded-2xl border border-blue-200/80 shadow-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-[#405CFF] flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Validation Suite Staged
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {repairState === 'ready' 
                  ? `AI patch generated for ${selectedIncidentApi}. Apply the fix in Smart Repair to execute automated live gateway validation.`
                  : `Verification vectors ready. Run tests anytime to verify baseline schema compliance for ${selectedIncidentApi}.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => setActivePage('smart-repair')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D3B70] hover:bg-[#152B52] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              Go to Smart Repair →
            </button>
          </div>
        </div>
      )}

      {/* Card 3: Live Gateway Proxy Verification (Step 11) */}
      {repairState === 'applied' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-7 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900">
                Live Gateway Proxy Verification (Step 11)
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              GET /api/proxy/{selectedIncidentApi?.toLowerCase().includes('user') ? 'users' : 'weather'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Downstream services query the proxy gateway. The compatibility adapter intercepts upstream differences and normalizes the payload back to the expected baseline schema:
          </p>
          <div className="bg-[#0B172A] rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner border border-slate-800">
            <pre>
              {JSON.stringify(
                proxyResponse || (
                  selectedIncidentApi?.toLowerCase().includes('user')
                    ? { id: 1, name: "Rahul", email: "rahul@internal.org", _adapted: true }
                    : { temp: 24, condition: "Sunny", humidity: 45, city: "Indore" }
                ),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
