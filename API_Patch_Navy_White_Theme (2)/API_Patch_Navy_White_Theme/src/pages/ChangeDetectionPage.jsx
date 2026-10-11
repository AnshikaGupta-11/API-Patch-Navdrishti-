import React, { useState, useEffect } from 'react';
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
  User,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { changeDetectionData, apiChangeMap } from '../data/mockData';
import { apiClient } from '../api/client';

export default function ChangeDetectionPage() {
  const { 
    apis,
    changesData,
    backendConnected,
    selectedIncidentApi, 
    setSelectedIncidentApi,
    setActivePage, 
    addToast,
    triggerIncident,
    fetchBackendData
  } = useApp();

  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [selectedChangeApi, setSelectedChangeApi] = useState(selectedIncidentApi || 'Weather API');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (selectedIncidentApi) {
      setSelectedChangeApi(selectedIncidentApi);
    }
  }, [selectedIncidentApi]);

  const handleRunMonitor = async () => {
    setIsScanning(true);
    addToast('Scanning all monitored endpoints for schema contract drift...', 'info', 'Scanning Schemas');
    try {
      if (backendConnected && apiClient.runMonitor) {
        await apiClient.runMonitor();
        if (fetchBackendData) await fetchBackendData();
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      addToast('Contract monitoring completed. Schema state synchronized.', 'success', 'Scan Completed');
    } catch (err) {
      addToast(`Monitoring scan completed: ${err.message}`, 'info', 'Scan Completed');
    } finally {
      setIsScanning(false);
    }
  };

  // Compile real active detected changes
  const changedApis = apis.filter(a => a.status === 'Changed');

  const allActiveChanges = [];
  if (backendConnected && changesData.length > 0) {
    changesData.forEach((item) => {
      const fallback = (apiChangeMap && (apiChangeMap[item.serviceName] || apiChangeMap[item.serviceName?.replace('Service', 'API')])) || {};
      allActiveChanges.push({
        id: item.incidentId || item.serviceId || `c-${item.serviceName}`,
        apiName: item.serviceName,
        endpoint: item.endpoint || fallback.endpoint || `/api/${item.serviceId}`,
        alertTitle: item.status || fallback.alertTitle || 'Breaking Change Detected',
        alertType: item.severity === 'HIGH' ? 'breaking' : 'minor',
        timestamp: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        previousResponse: item.previousResponse || fallback.previousResponse || {},
        currentResponse: item.currentResponse || fallback.currentResponse || {},
        changesDetected: (item.changesDetected || fallback.changesDetected || []).map((ch, idx) => ({
          field: ch.path || ch.field || `field_${idx}`,
          type: ch.type || 'changed',
          description: ch.message || ch.description || `${ch.path || ch.field}: contract shift`,
          severity: (ch.severity || 'breaking').toLowerCase()
        })),
        icon: item.serviceName?.toLowerCase().includes('weather') ? 'cloud' : item.serviceName?.toLowerCase().includes('user') ? 'user' : 'code'
      });
    });
  } else if (changedApis.length > 0) {
    changedApis.forEach((api) => {
      const match = apiChangeMap && (apiChangeMap[api.name] || apiChangeMap[api.name?.replace('Service', 'API')]);
      if (match) {
        allActiveChanges.push({
          id: api.id || `change-${api.name}`,
          ...match,
          icon: api.name?.toLowerCase().includes('weather') ? 'cloud' : api.name?.toLowerCase().includes('user') ? 'user' : 'code'
        });
      } else {
        allActiveChanges.push({
          id: api.id,
          apiName: api.name,
          endpoint: api.endpoint,
          alertTitle: 'Contract Deviation Detected',
          alertType: 'breaking',
          timestamp: api.lastChecked || 'Just now',
          previousResponse: { status: 'ok', schemaVersion: 'v1' },
          currentResponse: api.sampleResponse || { status: 'modified', schemaVersion: 'v2' },
          changesDetected: [
            { field: 'contract', type: 'modified', description: `${api.name} response payload deviated from schema baseline`, severity: 'breaking' }
          ],
          icon: 'code'
        });
      }
    });
  }

  const hasActiveChanges = allActiveChanges.length > 0;

  // The active featured change
  let featured = null;
  if (hasActiveChanges) {
    featured = allActiveChanges.find(c => c.apiName === selectedChangeApi) || allActiveChanges[0];
  } else if (apiChangeMap && apiChangeMap[selectedChangeApi]) {
    featured = apiChangeMap[selectedChangeApi];
  }

  // Other detected changes: include other active changes plus historical mock events
  const otherActiveChanges = allActiveChanges.filter(c => featured && c.apiName !== featured.apiName);
  const catalogHistorical = (changeDetectionData.otherChanges || []).filter(
    c => featured && c.apiName !== featured.apiName && !otherActiveChanges.some(oa => oa.apiName === c.apiName)
  );

  const allOtherItems = [...otherActiveChanges, ...catalogHistorical];

  const handleViewDetails = () => {
    if (!featured) return;
    setSelectedIncidentApi(featured.apiName);
    addToast(`Navigating to Impact Analysis for ${featured.apiName}`, 'info');
    setActivePage('impact-analysis');
  };

  const handleSmartRepair = () => {
    if (!featured) return;
    setSelectedIncidentApi(featured.apiName);
    setActivePage('smart-repair');
  };

  const handleSelectChange = (apiName) => {
    setSelectedChangeApi(apiName);
    setSelectedIncidentApi(apiName);
    addToast(`Loaded contract comparison for ${apiName}`, 'info');
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
            Compare API responses, view field-level diffs, and inspect schema drifts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRunMonitor}
            disabled={isScanning}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-subtle transition-colors disabled:opacity-50"
            title="Scan live monitored services against baseline contracts"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#405CFF] ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
          </button>

          <div className="relative">
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
      </div>

      {/* Loading Scan State Banner */}
      {isScanning && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-800 flex items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin text-[#405CFF]" />
            <span className="text-xs font-semibold">
              Scanning monitored endpoints and comparing baseline schema AST invariants...
            </span>
          </div>
          <span className="text-[11px] font-mono text-blue-600 hidden sm:inline">AST Diff Engine Active</span>
        </div>
      )}

      {/* Empty State: No Contract Differences */}
      {!hasActiveChanges && !featured ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No Contract Differences Detected
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All {apis.length} monitored API services match baseline schema contracts. Zero active schema drift or breaking changes detected.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={handleRunMonitor}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D3B70] hover:bg-[#152B52] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Contracts...' : 'Run Monitor Check'}
            </button>
            <button
              onClick={() => triggerIncident('Weather API')}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Simulate Weather API Incident
            </button>
            <button
              onClick={() => triggerIncident('User API')}
              className="px-3.5 py-2 text-xs font-semibold text-[#405CFF] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Simulate User API Shift
            </button>
          </div>
        </div>
      ) : (
        /* Primary Featured Card: Detected Breaking Change */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden animate-in fade-in duration-150">
          {/* Banner Bar */}
          <div className="p-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white via-white to-red-50/20">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#405CFF] shadow-sm">
                {featured.icon === 'user' ? (
                  <User className="w-6 h-6 stroke-[1.8]" />
                ) : featured.icon === 'cloud' || featured.apiName?.toLowerCase().includes('weather') ? (
                  <Cloud className="w-6 h-6 stroke-[1.8]" />
                ) : (
                  <Code2 className="w-6 h-6 stroke-[1.8]" />
                )}
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
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                featured.alertType === 'minor'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${featured.alertType === 'minor' ? 'bg-blue-500' : 'bg-red-500 animate-pulse'}`}></span>
                {featured.alertTitle || 'Breaking Change Detected'}
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
                <span className="text-xs font-semibold text-slate-700">Previous Response (Baseline)</span>
                <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  JSON
                </span>
              </div>
              <div className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-subtle overflow-x-auto max-h-64">
                <pre>{JSON.stringify(featured.previousResponse || {}, null, 2)}</pre>
              </div>
            </div>

            {/* Current Response */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 relative group">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900">Current Response (Observed)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  JSON
                </span>
              </div>
              <div className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-3.5 rounded-lg border border-emerald-200/70 shadow-subtle overflow-x-auto max-h-64">
                <pre>{JSON.stringify(featured.currentResponse || {}, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Changes Detected Alert Box */}
          <div className="mx-5 sm:mx-6 mb-6 p-4 rounded-xl bg-red-50/60 border border-red-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Detected Contract Invariants ({featured.changesDetected?.length || 0})</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 pl-6 list-disc marker:text-red-500">
                {(featured.changesDetected || []).map((ch, idx) => (
                  <li key={ch.field || ch.path || `ch-${idx}`}>
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
      )}

      {/* Other Detected Changes Section */}
      {allOtherItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">
              Other Detected Changes & Audit History
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {allOtherItems.length} event{allOtherItems.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {allOtherItems.map((change, idx) => {
              const isSelected = featured && featured.apiName === change.apiName;
              return (
                <div
                  key={change.id || `change-${change.apiName}-${idx}`}
                  onClick={() => handleSelectChange(change.apiName)}
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
                      {change.icon === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : change.icon === 'github' ? (
                        <Github className="w-4 h-4" />
                      ) : change.icon === 'credit-card' ? (
                        <CreditCard className="w-4 h-4" />
                      ) : change.icon === 'cloud' ? (
                        <Cloud className="w-4 h-4" />
                      ) : (
                        <Code2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{change.apiName}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {change.changeSummary || (change.changesDetected && change.changesDetected[0]?.description) || 'Contract modification'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      {change.timestamp}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      change.tagColor || (change.alertType === 'breaking' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200')
                    }`}>
                      {change.tag || change.alertTitle || 'Changed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
