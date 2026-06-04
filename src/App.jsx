import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import CommandPalette from './components/global/CommandPalette';
import NotificationCenter from './components/global/NotificationCenter';
import ChatView from './views/ChatView';
import LeadsView from './views/LeadsView';
import ProductsView from './views/ProductsView';
import PipelineView from './views/PipelineView';
import SchedulerView from './views/SchedulerView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';
import LandingPage from './views/LandingPage';
import { useApp } from './context/AppContext';

function AppShell() {
  const { state } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const viewMap = {
    chat: ChatView,
    leads: LeadsView,
    products: ProductsView,
    pipeline: PipelineView,
    scheduler: SchedulerView,
    analytics: AnalyticsView,
    settings: SettingsView,
  };

  const ActiveView = viewMap[state.activeView] || ChatView;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          onSearchOpen={() => setCommandPaletteOpen(true)}
          onNotificationsOpen={() => setNotificationsOpen(true)}
        />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <ActiveView key={state.activeView} />
          </AnimatePresence>
        </main>
      </div>

      {/* Overlays */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(() => {
    // Check URL hash or default to landing page
    return window.location.hash !== '#app';
  });

  useEffect(() => {
    const onHash = () => setShowLanding(window.location.hash !== '#app');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const enterApp = () => {
    window.location.hash = '#app';
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingPage onEnterApp={enterApp} />;
  }

  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}
