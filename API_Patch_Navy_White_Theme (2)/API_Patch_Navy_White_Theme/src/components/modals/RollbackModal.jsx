import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RollbackModal() {
  const { isRollbackModalOpen, setIsRollbackModalOpen, rollbackFix, selectedIncidentApi } = useApp();

  if (!isRollbackModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsRollbackModalOpen(false)}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900">Confirm Rollback</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Are you sure you want to revert the autonomous patch applied to <strong className="text-slate-900">{selectedIncidentApi}</strong>? This will restore the pre-repair schema mapping in the simulation sandbox.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRollbackModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => rollbackFix(selectedIncidentApi)}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Confirm & Rollback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
