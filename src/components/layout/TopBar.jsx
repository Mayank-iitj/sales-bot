import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TopBar({ onSearchOpen, onNotificationsOpen }) {
  const { state } = useApp();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  const viewLabels = {
    chat: 'AI Chat',
    leads: 'Lead Manager',
    products: 'Products & Pricing',
    pipeline: 'Deal Pipeline',
    scheduler: 'Demo Scheduler',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  return (
    <header style={{
      height: 56,
      background: 'rgba(8, 4, 54, 0.3)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(197, 185, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
          VelocityHQ
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/</span>
        <motion.span
          key={state.activeView}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          {viewLabels[state.activeView]}
        </motion.span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search Button */}
        <button
          onClick={onSearchOpen}
          className="btn-icon"
          title="Search (Ctrl+K)"
          style={{ position: 'relative' }}
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsOpen}
          className="btn-icon"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--accent-danger)',
                color: 'white', fontSize: '0.65rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}
            >
              {unreadCount}
            </motion.span>
          )}
        </button>

        {/* Profile */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: 8, cursor: 'pointer',
        }}>
          <User size={16} color="white" />
        </div>
      </div>
    </header>
  );
}
