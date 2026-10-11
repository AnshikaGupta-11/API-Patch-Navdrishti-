import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  FileCode2, 
  GitFork, 
  Wrench, 
  ShieldCheck, 
  Settings, 
  Globe,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activePage, setActivePage, unresolvedCount = 0 } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apis', label: 'APIs', icon: Server },
    { id: 'change-detection', label: 'Change Detection', icon: FileCode2 },
    { id: 'impact-analysis', label: 'Impact Analysis', icon: GitFork },
    { id: 'smart-repair', label: 'Smart Repair', icon: Wrench },
    { id: 'validation-recovery', label: 'Validation & Recovery', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B172A] border-r border-[#1E293B]/70 flex flex-col transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 pb-6 border-b border-[#1E293B]/50">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#405CFF] to-[#6555FF] flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 flex-shrink-0">
              <Globe className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight leading-tight">
                API Patch
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-wide">
                Keep software working when APIs change.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-left
                  ${isActive 
                    ? 'bg-[#1D3B70] text-white shadow-sm shadow-[#1D3B70]/50 font-semibold' 
                    : 'text-slate-300 hover:text-white hover:bg-[#13284A]/60'}
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'change-detection' && (
                  <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    unresolvedCount > 0 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {unresolvedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Stay ahead of API changes banner */}
        <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-[#13284A]/80 to-[#0F1F38] border border-[#1E3A8A]/40 text-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#405CFF]/15 blur-md pointer-events-none"></div>
          <p className="text-[11px] font-semibold text-slate-200">
            Stay ahead of API changes!
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Autonomous schema monitoring active
          </p>
        </div>

        {/* Sidebar Footer with System Online Status */}
        <div className="p-4 border-t border-[#1E293B]/60 bg-[#081222]/80">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">
              System Online
            </span>
            <span className="ml-auto text-[10px] text-slate-500">
              v2.4.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
