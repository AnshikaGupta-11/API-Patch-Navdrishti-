import React, { useState } from 'react';
import { X, Check, Code, GitCommit, Shield, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { smartRepairData, smartRepairDataMap } from '../../data/mockData';

export default function ManualReviewModal() {
  const { isManualReviewOpen, setIsManualReviewOpen, applyFix, addToast, selectedIncidentApi } = useApp();
  const [activeTab, setActiveTab] = useState('diff');

  const activeRepair = (smartRepairDataMap && smartRepairDataMap[selectedIncidentApi]) || smartRepairData;

  if (!isManualReviewOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6555FF]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manual Code Review & Diff Inspector ({activeRepair.apiName})</h3>
              <p className="text-xs text-slate-500">Target File: <span className="font-mono text-slate-700">{activeRepair.filePath}</span></p>
            </div>
          </div>
          <button
            onClick={() => setIsManualReviewOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4">
          <button
            onClick={() => setActiveTab('diff')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'diff' 
                ? 'border-[#405CFF] text-[#405CFF]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Unified Diff View
          </button>
          <button
            onClick={() => setActiveTab('ast')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ast' 
                ? 'border-[#405CFF] text-[#405CFF]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transform Logic & Ast Patch
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'audit' 
                ? 'border-[#405CFF] text-[#405CFF]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Safety Audit & Rollback Snapshot
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'diff' && (
            <div>
              <div className="p-2 bg-slate-100 text-slate-600 text-[11px] font-mono rounded-t-lg border border-slate-200 border-b-0 flex items-center justify-between">
                <span>@@ {activeRepair.filePath}</span>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{activeRepair.apiName} Patch</span>
              </div>
              <div className="bg-[#0B172A] p-4 rounded-b-lg font-mono text-xs leading-relaxed overflow-x-auto text-slate-200">
                {activeRepair.diffLines.map((line, idx) => {
                  let lineStyle = 'text-slate-300';
                  let bgStyle = '';
                  if (line.type === 'removed') {
                    lineStyle = 'text-red-400 font-semibold';
                    bgStyle = 'bg-red-500/10 px-1 -mx-1 rounded';
                  } else if (line.type === 'added') {
                    lineStyle = 'text-emerald-400 font-semibold';
                    bgStyle = 'bg-emerald-500/10 px-1 -mx-1 rounded';
                  }

                  return (
                    <div key={idx} className={`${lineStyle} ${bgStyle}`}>
                      {line.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'ast' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-2">Automated Transformation Wrapper</p>
                <p className="text-slate-600 leading-relaxed">
                  The AST replacer introduces nullish coalescing to prevent application crashes when either legacy or updated payloads arrive.
                </p>
              </div>
              <pre className="p-4 bg-[#0B172A] rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto">
                {activeRepair.rawFixCode}
              </pre>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Zero Downtime Migration Guarantee</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    No breaking changes introduced to consumer services. Previous contracts remain 100% satisfied.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {activeRepair.manualReviewNotes.map((note, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#405CFF] mt-1.5 flex-shrink-0"></span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setIsManualReviewOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel Review
          </button>

          <button
            onClick={() => {
              setIsManualReviewOpen(false);
              applyFix(activeRepair.apiName);
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            Approve & Apply This Fix
          </button>
        </div>
      </div>
    </div>
  );
}
