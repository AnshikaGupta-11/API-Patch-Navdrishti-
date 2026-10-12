import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { getCurrentLocalDate } from './utils/time';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Toast from './components/layout/Toast';
import DemoToolbar from './components/layout/DemoToolbar';
import AddApiModal from './components/modals/AddApiModal';
import ApiDetailsModal from './components/modals/ApiDetailsModal';
import ManualReviewModal from './components/modals/ManualReviewModal';
import LogsModal from './components/modals/LogsModal';
import RollbackModal from './components/modals/RollbackModal';
import ErrorBoundary from './components/layout/ErrorBoundary';

// Pages
import DashboardPage from './pages/DashboardPage';
import ApisPage from './pages/ApisPage';
import ChangeDetectionPage from './pages/ChangeDetectionPage';
import ImpactAnalysisPage from './pages/ImpactAnalysisPage';
import SmartRepairPage from './pages/SmartRepairPage';
import ValidationRecoveryPage from './pages/ValidationRecoveryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  const { activePage, setActivePage, themeMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync activePage with browser URL pathname (/login, /signup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname === '/login') {
        setActivePage('login');
      } else if (pathname === '/signup') {
        setActivePage('signup');
      }

      const handlePopState = () => {
        const path = window.location.pathname.toLowerCase();
        if (path === '/login') setActivePage('login');
        else if (path === '/signup') setActivePage('signup');
        else setActivePage('dashboard');
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [setActivePage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.toLowerCase();
      if (activePage === 'login' && currentPath !== '/login') {
        window.history.pushState(null, '', '/login');
      } else if (activePage === 'signup' && currentPath !== '/signup') {
        window.history.pushState(null, '', '/signup');
      } else if (activePage !== 'login' && activePage !== 'signup' && (currentPath === '/login' || currentPath === '/signup')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activePage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      
      if (e.key === '1') setActivePage('dashboard');
      if (e.key === '2') setActivePage('apis');
      if (e.key === '3') setActivePage('change-detection');
      if (e.key === '4') setActivePage('impact-analysis');
      if (e.key === '5') setActivePage('smart-repair');
      if (e.key === '6') setActivePage('validation-recovery');
      if (e.key === '7') setActivePage('settings');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePage]);

  // Full-page modern authentication views
  if (activePage === 'login') {
    return (
      <div className="min-h-screen bg-[#050D1B]">
        <LoginPage />
        <Toast />
        <DemoToolbar />
      </div>
    );
  }

  if (activePage === 'signup') {
    return (
      <div className="min-h-screen bg-[#050D1B]">
        <SignupPage />
        <Toast />
        <DemoToolbar />
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'apis':
        return <ApisPage />;
      case 'change-detection':
        return <ChangeDetectionPage />;
      case 'impact-analysis':
        return <ImpactAnalysisPage />;
      case 'smart-repair':
        return <SmartRepairPage />;
      case 'validation-recovery':
        return <ValidationRecoveryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      default:
        return <DashboardPage />;
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen bg-[#050D1B] ${isDark ? 'dark text-slate-100' : 'text-slate-900'} flex transition-colors duration-200`}>
      {/* Persistent Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main App Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-[#050D1B]">
        {/* Inner Canvas Container */}
        <div className={`flex-1 flex flex-col min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#081224]' : 'bg-[#F7F9FD]'}`}>
          {/* Header */}
          <Header setMobileOpen={setMobileOpen} />

          {/* Page Content Canvas */}
          <main className="flex-1 p-4 sm:p-7 pb-24 sm:pb-28 max-w-[1536px] w-full mx-auto">
            <ErrorBoundary onReset={() => setActivePage('dashboard')}>
              {renderActivePage()}
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <footer className="px-6 py-4 border-t border-slate-200/70 bg-white/70 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>API Patch • Keep software working when APIs change</span>
            </div>
            <div className="text-slate-400">
              Demo sandbox prepared for hackathon presentation • {getCurrentLocalDate()}
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals & Toast Manager */}
      <AddApiModal />
      <ApiDetailsModal />
      <ManualReviewModal />
      <LogsModal />
      <RollbackModal />
      <Toast />
      <DemoToolbar />
    </div>
  );
}
