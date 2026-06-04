import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare, Users, Package, DollarSign, Calendar,
  BarChart3, Settings, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'chat',      label: 'Chat',      icon: MessageSquare },
  { id: 'leads',     label: 'Leads',     icon: Users },
  { id: 'products',  label: 'Products',  icon: Package },
  { id: 'pipeline',  label: 'Pipeline',  icon: DollarSign },
  { id: 'scheduler', label: 'Schedule',  icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { state, dispatch } = useApp();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        height: '100vh',
        background: 'rgba(8, 4, 54, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(197, 185, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Brand */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: 68,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={20} color="white" />
        </div>
        <motion.div
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.15 }}
          style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            VelocityHQ
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: -2 }}>
            Sales Intelligence
          </div>
        </motion.div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = state.activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 12px' : '10px 16px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(151, 125, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(151, 125, 255, 0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  position: 'relative', zIndex: 1, flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
              />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                transition={{ duration: 0.15 }}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: 8, borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            Collapse
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
