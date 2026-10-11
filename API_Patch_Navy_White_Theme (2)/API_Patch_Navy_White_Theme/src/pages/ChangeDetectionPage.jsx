import React, { useState } from 'react';
import { 
  Cloud, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileCode, 
  GitCompare, 
  Github, 
  CreditCard,
  Code2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { changeDetectionData, apiChangeMap } from '../data/mockData';

export default function ChangeDetectionPage() {
  const { setActivePage, addToast, selectedIncidentApi, setSelectedIncidentApi } = useApp();
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [selectedChangeApi, setSelectedChangeApi] = useState(selectedIncidentApi || 'Weather API');

  const featured = (apiChangeMap && apiChangeMap[selectedChangeApi]) || changeDetectionData.featured;
  const { otherChanges } = changeDetectionData;

  const handleViewDetails = () => {
    setSelectedIncidentApi(featured.apiName);
    addToast(`Navigating to Impact Analysis for ${featured.apiName}`, 'info');
    setActivePage('impact-analysis');
  };

  const handleSmartRepair = () => {
    setSelectedIncidentApi(featured.apiName);
    setActivePage('smart-repair');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Change Detection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare API responses and detect breaking changes in schema contracts.
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 cursor-pointer shadow-subtle"
          >
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Primary Featured Card: Weather API Breaking Change */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        {/* Banner Bar */}
        <div className="p-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-white to-red-50/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#405CFF] shadow-sm">
              <Cloud className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{featured.apiName}</h3>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">v1</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {featured.endpoint}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {featured.alertTitle}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1 font-medium">
              {featured.timestamp}
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Previous Response */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 relative group">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700">Previous Response</span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                JSON
              </span>
            </div>
            <div className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-subtle overflow-x-auto">
              <pre>{JSON.stringify(featured.previousResponse, null, 2)}</pre>
            </div>
          </div>

          {/* Current Response */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 relative group">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900">Current Response</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                JSON
              </span>
            </div>
            <div className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-3.5 rounded-lg border border-emerald-200/70 shadow-subtle overflow-x-auto">
              <pre>{JSON.stringify(featured.currentResponse, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Changes Detected Alert Box */}
        <div className="mx-5 sm:mx-6 mb-6 p-4 rounded-xl bg-red-50/60 border border-red-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Changes Detected</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-1 pl-6 list-disc marker:text-red-500">
              {featured.changesDetected.map((ch, idx) => (
                <li key={idx}>
                  {ch.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSmartRepair}
              className="px-3.5 py-2 text-xs font-semibold text-[#6555FF] bg-white hover:bg-violet-50 rounded-lg border border-[#D8D4FF] shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Smart Repair
            </button>
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D3B70] hover:bg-[#152B52] rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Other Detected Changes Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 px-1">
          Other Detected Changes
        </h3>

        <div className="space-y-3">
          {otherChanges.map((change) => {
            const isSelected = selectedChangeApi === change.apiName;
            return (
              <div
                key={change.id}
                onClick={() => {
                  setSelectedChangeApi(change.apiName);
                  addToast(`Loaded contract comparison for ${change.apiName}`, 'info');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected 
                    ? 'bg-blue-50/60 border-[#405CFF] shadow-card ring-1 ring-[#405CFF]/30' 
                    : 'bg-white border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#405CFF] text-white border-[#405CFF]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {change.icon === 'user' && <User className="w-4 h-4" />}
                    {change.icon === 'github' && <Github className="w-4 h-4" />}
                    {change.icon === 'credit-card' && <CreditCard className="w-4 h-4" />}
                    {change.icon === 'code' && <Code2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{change.apiName}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{change.changeSummary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {change.timestamp}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${change.tagColor}`}>
                    {change.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
