import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { loginUser, authLoading, setActivePage, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser({ email: email.trim(), password });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('lead.architect@internet-after-api.dev');
    setPassword('GuardianPass2026!');
    setErrorMsg('');
    addToast('Demo credentials prefilled (Persistent SQLite Account)', 'info', 'Demo Credentials');
  };

  return (
    <div className="min-h-screen bg-[#050D1B] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Cybersecurity Ambient Grid Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#405CFF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1D3B70]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #405CFF 1px, transparent 0)', backgroundSize: '28px 28px' }}
      ></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Branding Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1D3B70] via-[#405CFF] to-[#6555FF] text-white shadow-xl shadow-[#405CFF]/20 mb-4 ring-4 ring-[#0B172A]">
            <Shield className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            API Patch
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#13284A] text-[#405CFF] border border-[#1E3A8A]">
              Nav Drashti
            </span>
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
            Autonomous API Drift Defense & Zero-Downtime Compatibility Engine
          </p>
        </div>

        {/* Card Container */}
        <div className="mt-8 bg-[#0B172A] border border-[#1E293B] shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative">
          <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Sign in to your account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access the guardian console</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SQLite Online
            </span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium text-red-200">Authentication Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.dev"
                  className="block w-full pl-9 pr-3 py-2 bg-[#050D1B] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#405CFF] focus:border-[#405CFF] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-[#405CFF] hover:text-[#334CE0] hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  Fill Demo Account
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2 bg-[#050D1B] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#405CFF] focus:border-[#405CFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-[#050D1B] text-[#405CFF] focus:ring-[#405CFF] focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span>Keep session active</span>
              </label>

              <span className="text-[11px] text-slate-500 font-mono">
                Scrypt Hash Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#405CFF] to-[#6555FF] hover:from-[#334CE0] hover:to-[#5545EB] focus:outline-none focus:ring-2 focus:ring-[#405CFF]/50 shadow-lg shadow-[#405CFF]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Pre-fill Badge */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Don't have an account?</span>
            <button
              onClick={() => setActivePage('signup')}
              className="text-[#405CFF] hover:text-[#334CE0] font-medium text-xs hover:underline transition-colors"
            >
              Create Account →
            </button>
          </div>

          {/* Sandbox Bypass for Hackathon Demo */}
          <div className="mt-4 p-2.5 rounded-xl bg-[#13284A]/40 border border-[#1E3A8A]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] text-slate-300">Hackathon Judge / Sandbox Mode</span>
            </div>
            <button
              onClick={() => setActivePage('dashboard')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1D3B70] hover:bg-[#2A4E8F] text-white font-medium transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Persistent SQLite Database • Node.js Native Cryptography</span>
        </div>
      </div>
    </div>
  );
}
