import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[API Patch ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-8 bg-white rounded-2xl border border-red-200 shadow-card animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                View Recovered Gracefully
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An unexpected component rendering state was intercepted by API Patch. The application container and services remain fully intact.
              </p>
              {this.state.error?.message && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-red-600 overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Return to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
