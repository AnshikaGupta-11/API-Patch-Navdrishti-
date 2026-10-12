import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SignupPage() {
  const { signupUser, authLoading, setActivePage } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password requirements validation
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signupUser({
        name: name.trim(),
        email: email.trim(),
        password
      });
      setSuccessMsg('Account created successfully! Initializing workspace...');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050D1B] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Cybersecurity Ambient Grid Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#405CFF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1D3B70]/20 rounded-full blur-3xl pointer-events-none"></div>
      
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
              Register
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
              <h2 className="text-lg font-semibold text-white">Create your account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Deploy drift monitors and real-time schema patches</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono bg-[#405CFF]/15 text-[#405CFF] border border-[#405CFF]/30">
              Persistent DB
            </span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium text-red-200">Registration Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="block w-full pl-9 pr-3 py-2 bg-[#050D1B] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#405CFF] focus:border-[#405CFF] transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.dev"
                  className="block w-full pl-9 pr-3 py-2 bg-[#050D1B] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#405CFF] focus:border-[#405CFF] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-9 pr-10 py-2 bg-[#050D1B] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#405CFF] focus:border-[#405CFF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Indicators */}
            <div className="pt-1 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span>
                )}
                <span className={hasMinLength ? 'text-slate-300' : 'text-slate-500'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {passwordsMatch ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : confirmPassword ? (
                  <X className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block"></span>
                )}
                <span className={passwordsMatch ? 'text-slate-300' : 'text-slate-500'}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#405CFF] to-[#6555FF] hover:from-[#334CE0] hover:to-[#5545EB] focus:outline-none focus:ring-2 focus:ring-[#405CFF]/50 shadow-lg shadow-[#405CFF]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account in SQLite...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Nav to Login */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Already registered?</span>
            <button
              onClick={() => setActivePage('login')}
              className="text-[#405CFF] hover:text-[#334CE0] font-medium text-xs hover:underline transition-colors"
            >
              Sign In Instead →
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
          <span>Passwords securely salted and hashed with Node.js Scrypt</span>
        </div>
      </div>
    </div>
  );
}
