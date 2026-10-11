import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-[#405CFF] flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-emerald-950',
    warning: 'border-amber-200 bg-white text-amber-950',
    error: 'border-red-200 bg-white text-red-950',
    info: 'border-indigo-100 bg-white text-slate-900'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-modal flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 ${borders[toast.type] || borders.info}`}
        >
          <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
          <div className="flex-1 pr-2">
            {toast.title && (
              <h5 className="text-xs font-semibold text-slate-900 leading-snug">
                {toast.title}
              </h5>
            )}
            <p className="text-xs text-slate-600 leading-normal mt-0.5">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
