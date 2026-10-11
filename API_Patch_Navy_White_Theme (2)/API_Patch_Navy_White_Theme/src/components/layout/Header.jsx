import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, CheckCircle2, AlertTriangle, ShieldCheck, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header({ setMobileOpen }) {
  const { searchQuery, setSearchQuery, setActivePage, addToast, settings, unresolvedCount = 0, changesData = [], apis = [] } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const activeChanges = changesData.length > 0 
    ? changesData 
    : apis.filter(a => a.status === 'Changed').map(a => ({
        serviceId: a.id,
        serviceName: a.name,
        endpoint: a.endpoint,
        status: 'Breaking Change Detected',
        changesDetected: [{ description: 'Schema difference detected' }]
      }));

  const userInitials = (settings?.userFullName || 'AP')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AP';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Mobile Menu & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setActivePage('apis');
              }
            }}
            placeholder="Search APIs, services..."
            className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 focus:border-[#405CFF] transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded pointer-events-none">
            ↵
          </kbd>
        </div>
      </div>

      {/* Right Actions: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setAlertsOpen(prev => !prev);
              setProfileOpen(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unresolvedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Notifications</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  unresolvedCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {unresolvedCount} Active
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {activeChanges.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                    All monitored APIs are healthy (0 active breaking changes)
                  </div>
                ) : (
                  activeChanges.map((change, idx) => (
                    <div 
                      key={change.serviceId || change.incidentId || idx}
                      onClick={() => { setActivePage('change-detection'); setAlertsOpen(false); }}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3 items-start transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-800">{change.serviceName || change.apiName} breaking change</p>
                        <p className="text-[11px] text-slate-500">
                          {change.changesDetected?.[0]?.description || change.changesDetected?.[0]?.message || 'Schema differences detected'}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Active Incident</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => { setActivePage('change-detection'); setAlertsOpen(false); }}
                  className="text-[11px] text-[#405CFF] font-medium hover:underline"
                >
                  View all change events →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(prev => !prev);
              setAlertsOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B172A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {userInitials}
            </div>
            <span className="text-xs font-medium text-slate-800 hidden sm:inline">
              {settings.userFullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-modal border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{settings.userFullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{settings.userEmail}</p>
                <span className="inline-block mt-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {settings.userRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setActivePage('settings'); setProfileOpen(false); }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-left"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  Workspace Settings
                </button>
                <button
                  onClick={() => {
                    addToast('Connected with Hackathon 2026 Sandbox session', 'info');
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Security & API Keys
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    addToast('Session locked. Re-authenticate via SSO to resume.', 'warning');
                    setProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Lock / Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
