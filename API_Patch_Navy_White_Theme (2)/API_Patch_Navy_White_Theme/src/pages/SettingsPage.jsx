import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Sliders, 
  Palette, 
  Save, 
  Check, 
  RotateCcw,
  Key,
  Globe,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { settings, setSettings, addToast } = useApp();
  const [formData, setFormData] = useState({ ...settings });
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('Workspace preferences updated successfully', 'success', 'Settings Saved');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('iap_live_94f83921b7e61a');
    setApiKeyCopied(true);
    addToast('API key copied to clipboard', 'info');
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Settings & Workspace Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure profile details, alert triggers, theme identity, and API monitoring thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#405CFF] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operator Profile</h3>
              <p className="text-xs text-slate-500">Personal details for hackathon demo session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.userFullName}
                onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notification Email</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role & Permission Tier</label>
            <input
              type="text"
              value={formData.userRole}
              onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Autonomous Agent API Secret</label>
            <div className="flex items-center gap-2 p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs">
              <Key className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="flex-1">iap_live_94f83921b7e61a••••••••••••</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-2.5 py-1 text-[11px] font-sans font-semibold bg-slate-800 hover:bg-slate-700 rounded transition-colors text-white"
              >
                {apiKeyCopied ? 'Copied' : 'Copy Key'}
              </button>
            </div>
          </div>
        </div>

        {/* Theme & Design Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#6555FF] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Theme & Visual Identity</h3>
              <p className="text-xs text-slate-500">Preset color scheme matching the primary SaaS reference design</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Primary Palette (Dark Navy & Crisp White)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#050D1B] text-white rounded-lg text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#050D1B] border border-white/40"></span>
                Outer Navy #050D1B
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B172A] text-white rounded-lg text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B172A] border border-white/40"></span>
                Sidebar #0B172A
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1D3B70] text-white rounded-lg text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D3B70]"></span>
                Active #1D3B70
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7F9FD] border border-slate-300"></span>
                Canvas #F7F9FD
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#405CFF] text-white rounded-lg text-[10px] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-[#405CFF]"></span>
                Blue #405CFF
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notification & Alert Rules</h3>
              <p className="text-xs text-slate-500">Configure breaking change notification delivery</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Email Change Alerts</p>
                <p className="text-[11px] text-slate-500">Receive instant email digests when schema modifications are detected</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailAlerts')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.emailAlerts ? 'bg-[#405CFF]' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  formData.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Slack & Webhook Forwarding</p>
                <p className="text-[11px] text-slate-500">Stream critical breaking changes to engineering channels</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('slackAlerts')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.slackAlerts ? 'bg-[#405CFF]' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  formData.slackAlerts ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Strict Breaking Change Threshold</p>
                <p className="text-[11px] text-slate-500">Flag field type casting and nullability shifts as high severity</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('strictBreaking')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.strictBreaking ? 'bg-[#405CFF]' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  formData.strictBreaking ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Monitoring Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monitoring & Polling Parameters</h3>
              <p className="text-xs text-slate-500">Probe interval, latency degradation limits, and timeouts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Global Polling Interval</label>
              <select
                value={formData.pollingInterval}
                onChange={(e) => setFormData({ ...formData, pollingInterval: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white"
              >
                <option value="30s">Every 30 seconds (High frequency)</option>
                <option value="60s">Every 1 minute (Recommended)</option>
                <option value="5m">Every 5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Latency SLA Warning Threshold</label>
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white">
                <option>&gt; 300 ms (Standard SLA)</option>
                <option>&gt; 500 ms (Relaxed)</option>
                <option>&gt; 150 ms (Low Latency)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#405CFF] hover:bg-[#334CE0] text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
