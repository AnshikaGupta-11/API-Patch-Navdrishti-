import React, { useState } from 'react';
import { X, Server, Plus, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AddApiModal() {
  const { isAddApiOpen, setIsAddApiOpen, addApi } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    env: 'Production',
    method: 'GET',
    category: 'Backend Microservice',
    interval: '60s'
  });

  const [error, setError] = useState('');

  if (!isAddApiOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('API Name is required');
      return;
    }

    try {
      new URL(formData.endpoint);
    } catch {
      setError('Please enter a valid URL (e.g. https://api.service.com/v1/resource)');
      return;
    }

    addApi(formData);
    setIsAddApiOpen(false);
    setFormData({
      name: '',
      endpoint: '',
      env: 'Production',
      method: 'GET',
      category: 'Backend Microservice',
      interval: '60s'
    });
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsAddApiOpen(false)}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#405CFF]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Monitored API</h3>
              <p className="text-xs text-slate-500">Register a new endpoint for automated schema & uptime tracking</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddApiOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              API Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inventory Gateway API"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(''); }}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 focus:border-[#405CFF] text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Endpoint URL
            </label>
            <input
              type="url"
              required
              placeholder="https://api.yourdomain.com/v1/inventory"
              value={formData.endpoint}
              onChange={(e) => { setFormData({ ...formData, endpoint: e.target.value }); setError(''); }}
              className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 focus:border-[#405CFF] text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                HTTP Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Environment
              </label>
              <select
                value={formData.env}
                onChange={(e) => setFormData({ ...formData, env: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white"
              >
                <option value="Billing">Billing</option>
                <option value="AI Services">AI Services</option>
                <option value="Communication">Communication</option>
                <option value="Backend Microservice">Backend Microservice</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Observability">Observability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Check Interval
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#405CFF]/30 text-slate-800 bg-white"
              >
                <option value="30s">Every 30 seconds</option>
                <option value="60s">Every 1 minute</option>
                <option value="5m">Every 5 minutes</option>
                <option value="15m">Every 15 minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddApiOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#405CFF] hover:bg-[#334CE0] rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Connect API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
