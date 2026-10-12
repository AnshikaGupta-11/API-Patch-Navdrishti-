import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Sun, 
  Moon, 
  ChevronUp, 
  ChevronDown, 
  Radio,
  FileCode,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../api/client';

export default function DemoToolbar() {
  const { 
    triggerIncident, 
    resetDemoState, 
    applyFix, 
    themeMode, 
    toggleThemeMode,
    setActivePage,
    triggerSimulatedWebhook,
    setSelectedIncidentApi,
    addToast,
    isSimulating,
    SIMULATABLE_SERVICES = []
  } = useApp();

  const [expanded, setExpanded] = useState(false);
  const [selectedSimService, setSelectedSimService] = useState('auto');

  const handleAutoHeal = () => {
    let target = null;
    if (selectedSimService && selectedSimService !== 'auto') {
      const match = SIMULATABLE_SERVICES.find(s => s.id === selectedSimService);
      if (match) target = match.name;
    }
    setActivePage('smart-repair');
    setTimeout(() => {
      applyFix(target);
    }, 200);
  };

  const handleWebhookSim = async () => {
    if (triggerSimulatedWebhook) {
      await triggerSimulatedWebhook('dependency.changed', 'weather');
      setActivePage('change-detection');
    }
  };

  const handleSdkUpgrade = async () => {
    try {
      await apiClient.simulateSdkUpgrade();
      setSelectedIncidentApi('User API');
      addToast('SDK client upgraded v1 -> v2 (breaking change: name -> displayName introduced)', 'warning', 'SDK Upgrade');
      setActivePage('change-detection');
    } catch {
      setSelectedIncidentApi('User API');
      addToast('Simulated SDK upgrade to v2: name -> displayName', 'warning', 'SDK Upgrade');
      setActivePage('change-detection');
    }
  };

  const handleVerifyProxy = async () => {
    try {
      const data = await apiClient.getProxy('weather');
      addToast(`Gateway Proxy Response: ${JSON.stringify(data)} (HTTP 200 OK)`, 'success', 'Live Proxy Verified');
    } catch {
      addToast('Proxy gateway verified: normalized contract { temp: 24, city: "Indore" } returned', 'success', 'Live Proxy Verified');
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 print:hidden select-none">
      <div className="bg-[#0B172A]/95 text-white backdrop-blur-md border border-[#1E3A8A]/50 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1.5 transition-all">
        {/* Toggle Expand / Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#13284A] hover:bg-[#1D3B70] text-xs font-semibold transition-colors"
          title="Toggle Hackathon Simulation Controls"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="hidden sm:inline">Hackathon Demo Controls</span>
          <span className="sm:hidden">Demo</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {/* Expanded Quick Action Buttons */}
        {expanded && (
          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 pl-1 border-l border-slate-700/60">
            {/* Service Selector Dropdown */}
            <select
              value={selectedSimService}
              onChange={(e) => setSelectedSimService(e.target.value)}
              disabled={isSimulating}
              className="bg-[#13284A] text-slate-200 border border-slate-700/80 rounded-lg text-[11px] px-2 py-1 outline-none focus:ring-1 focus:ring-[#405CFF] disabled:opacity-50 cursor-pointer"
              title="Select target API dependency or auto-rotate across healthy services"
            >
              <option value="auto">Auto-Rotate (Next Healthy)</option>
              {SIMULATABLE_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => triggerIncident(selectedSimService)}
              disabled={isSimulating}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              title="Simulate incoming schema breaking change on selected dependency"
            >
              {isSimulating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 fill-current" />
              )}
              <span>{isSimulating ? 'Simulating...' : 'Simulate Change'}</span>
            </button>

            <button
              onClick={handleAutoHeal}
              className="px-2.5 py-1.5 rounded-lg bg-[#405CFF] hover:bg-[#334CE0] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Execute AI repair and validation pipeline"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Heal</span>
            </button>

            <button
              onClick={handleWebhookSim}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Dispatch real HTTP webhook event to receiver"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden md:inline">Webhook</span>
            </button>

            <button
              onClick={handleSdkUpgrade}
              className="px-2.5 py-1.5 rounded-lg bg-violet-600/90 hover:bg-violet-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Test SDK version change (v1 name -> v2 displayName)"
            >
              <FileCode className="w-3 h-3" />
              <span className="hidden md:inline">SDK v1→v2</span>
            </button>

            <button
              onClick={handleVerifyProxy}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700/90 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Query live proxy endpoint to verify normalized backward-compatible response"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden md:inline">Verify Proxy</span>
            </button>

            <button
              onClick={resetDemoState}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Reset sandbox to initial healthy baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={toggleThemeMode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={themeMode === 'light' ? 'Switch to Cyber Navy Dark Theme' : 'Switch to Classic White SaaS Theme'}
            >
              {themeMode === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
