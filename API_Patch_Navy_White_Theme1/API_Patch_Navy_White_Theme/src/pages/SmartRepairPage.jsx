import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Code, 
  GitCommit, 
  CheckCircle2, 
  RefreshCw, 
  Wrench, 
  ShieldCheck, 
  Cpu, 
  XCircle, 
  ChevronDown 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { smartRepairData, getSmartRepairData } from '../data/mockData';

export default function SmartRepairPage() {
  const { 
    applyFix, 
    rejectFix, 
    isApplyingFix, 
    repairState, 
    setIsManualReviewOpen, 
    addToast, 
    setActivePage,
    selectedIncidentApi,
    setSelectedIncidentApi,
    apis = [],
    changesData = [],
    unresolvedCount = 0,
    backendConnected = false,
    triggerIncident,
    isSimulating
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Derive active broken services strictly from real active state
  const activeIncidentApis = backendConnected
    ? Array.from(new Set(changesData.map(c => c.serviceName).filter(Boolean)))
    : Array.from(new Set(apis.filter(a => a.status === 'Changed' || a.hasBreakingChange).map(a => a.name).filter(Boolean)));

  const hasActiveChanges = activeIncidentApis.length > 0 && unresolvedCount > 0;

  // Derive target API: keep selected if active, else default to first active API
  const currentTargetApi = (selectedIncidentApi && activeIncidentApis.includes(selectedIncidentApi))
    ? selectedIncidentApi
    : (activeIncidentApis[0] || null);

  useEffect(() => {
    if (currentTargetApi && selectedIncidentApi !== currentTargetApi) {
      setSelectedIncidentApi(currentTargetApi);
    }
  }, [currentTargetApi, selectedIncidentApi, setSelectedIncidentApi]);

  const activeRepair = (currentTargetApi && getSmartRepairData(currentTargetApi)) || smartRepairData;

  const handleCopyFix = () => {
    if (!activeRepair?.rawFixCode) return;
    navigator.clipboard.writeText(activeRepair.rawFixCode);
    setCopied(true);
    addToast(`Suggested adapter fix code for ${activeRepair.apiName} copied`, 'info', 'Copied');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleApplyClick = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmApply = () => {
    setConfirmModalOpen(false);
    if (activeRepair?.apiName) {
      applyFix(activeRepair.apiName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Smart Repair
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            AI-powered suggestions to fix breaking changes autonomously.
          </p>
        </div>

        {hasActiveChanges && (
          <div className="flex items-center gap-2">
            {/* Active Incident Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle overflow-x-auto">
              {activeIncidentApis.map((apiName) => {
                const isSelected = currentTargetApi === apiName;
                return (
                  <button
                    key={apiName}
                    onClick={() => setSelectedIncidentApi(apiName)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#1D3B70] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-red-500'}`}></span>
                    {apiName}
                  </button>
                );
              })}
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-[#6555FF] border border-violet-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#6555FF]" />
              AI Analysis Complete
            </span>
          </div>
        )}
      </div>

      {!hasActiveChanges ? (
        /* Empty State: 0 Active Changes Require Repair */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No Active Changes Require Repair
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All monitored API services are operating within contract baselines. There are no breaking schema drifts or unresolved incidents at this time.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={() => triggerIncident('auto')}
              disabled={isSimulating}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isSimulating ? 'Simulating...' : 'Simulate API Change'}
            </button>
            <button
              onClick={() => setActivePage('change-detection')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              View Change Detection
            </button>
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Main Repair Card */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          {/* Suggestion Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6555FF] shadow-sm flex-shrink-0">
              <Sparkles className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {activeRepair.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeRepair.description}
              </p>
            </div>
          </div>

          {/* Diff Code Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {activeRepair.instruction}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Target: {activeRepair.filePath}
              </span>
            </div>

            <div className="relative rounded-xl border border-slate-200 bg-[#0B172A] p-4 sm:p-5 font-mono text-xs overflow-hidden shadow-inner">
              {/* Copy Button */}
              <button
                onClick={handleCopyFix}
                className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] flex items-center gap-1.5 shadow-sm transition-all z-10"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Fix'}
              </button>

              {/* Code lines matching diff */}
              <div className="space-y-1 text-slate-300 leading-relaxed pr-24">
                {(activeRepair.diffLines || []).map((line, idx) => {
                  const lineKey = `diff-${idx}-${line.type}-${line.text?.substring(0, 12)}`;
                  if (line.type === 'removed') {
                    return (
                      <div key={lineKey} className="text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded -mx-2">
                        {line.text}
                      </div>
                    );
                  }
                  if (line.type === 'added') {
                    return (
                      <div key={lineKey} className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded -mx-2">
                        {line.text}
                      </div>
                    );
                  }
                  return (
                    <div key={lineKey} className="text-slate-400">
                      {line.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Apply Fix Section with Approval / Rejection (Workflow Step 6) */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Developer Approval & Deployment</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Review changes and choose whether to apply autonomous adapter or request manual audit.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Reject & Keep Monitoring (Workflow Step 6: Human in the loop) */}
              <button
                onClick={() => rejectFix(activeRepair.apiName)}
                className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reject automated fix and require human manual intervention"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject / Human Review
              </button>

              <button
                onClick={() => setIsManualReviewOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-subtle"
              >
                Manual Review
              </button>

              <button
                onClick={handleApplyClick}
                disabled={isApplyingFix}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isApplyingFix ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Applying Fix...
                  </>
                ) : (
                  <>
                    Apply Automatically
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Before Applying Fix */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#405CFF] flex items-center justify-center mb-1">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Apply Simulated AI Fix?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will execute the simulated AST transform on the <strong>{activeRepair.apiName || selectedIncidentApi}</strong> client adapter, updating dependent frontend & backend microservices to support both modified and baseline schema contracts.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Snapshot created for instant rollback
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Automated test verification suite staged
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isApplyingFix}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isApplyingFix ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Applying Fix...
                  </>
                ) : (
                  'Confirm & Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
