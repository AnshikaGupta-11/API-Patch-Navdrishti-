import React, { useState } from 'react';
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
import { smartRepairData, smartRepairDataMap } from '../data/mockData';

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
    setSelectedIncidentApi
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const activeRepair = (smartRepairDataMap && smartRepairDataMap[selectedIncidentApi]) || smartRepairData;

  const handleCopyFix = () => {
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
    applyFix(activeRepair.apiName);
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

        <div className="flex items-center gap-2">
          {/* Active Incident Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle">
            <button
              onClick={() => setSelectedIncidentApi('Weather API')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedIncidentApi !== 'User API'
                  ? 'bg-[#1D3B70] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weather API
            </button>
            <button
              onClick={() => setSelectedIncidentApi('User API')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedIncidentApi === 'User API'
                  ? 'bg-[#1D3B70] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              User API
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-[#6555FF] border border-violet-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#6555FF]" />
            AI Analysis Complete
          </span>
        </div>
      </div>

      {/* Main Repair Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
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
              {activeRepair.diffLines.map((line, idx) => {
                if (line.type === 'removed') {
                  return (
                    <div key={idx} className="text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded -mx-2">
                      {line.text}
                    </div>
                  );
                }
                if (line.type === 'added') {
                  return (
                    <div key={idx} className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded -mx-2">
                      {line.text}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="text-slate-400">
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
                This will execute the simulated AST transform on the Weather API client adapter, updating dependent frontend & backend microservices to support both <code className="bg-slate-100 text-indigo-700 font-mono px-1 rounded">temperature</code> and legacy fields.
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
