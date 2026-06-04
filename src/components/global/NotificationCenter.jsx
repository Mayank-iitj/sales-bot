import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, MessageSquare, Users, Calendar, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const typeConfig = {
  lead: { icon: Users, color: 'var(--accent-danger)' },
  demo: { icon: Calendar, color: 'var(--accent-primary)' },
  deal: { icon: MessageSquare, color: 'var(--accent-success)' },
  system: { icon: AlertCircle, color: 'var(--accent-secondary)' },
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationCenter({ isOpen, onClose }) {
  const { state, dispatch } = useApp();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.3)',
            }}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 380, zIndex: 51,
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                  fontWeight: 700, color: 'var(--text-primary)', margin: 0,
                }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--accent-danger)', color: 'white',
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)',
                  }}>{unreadCount}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--accent-primary)', fontSize: '0.75rem',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <Check size={14} style={{ marginRight: 4 }} />
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="btn-icon">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
              <AnimatePresence>
                {state.notifications.map((notif, idx) => {
                  const config = typeConfig[notif.type] || typeConfig.system;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })}
                      style={{
                        display: 'flex', gap: 12, padding: '14px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: notif.read ? 'transparent' : 'rgba(61,127,255,0.05)',
                        borderLeft: notif.read ? '3px solid transparent' : `3px solid ${config.color}`,
                        transition: 'all 0.15s ease',
                        marginBottom: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(61,127,255,0.05)'}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${config.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} style={{ color: config.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.8rem', fontWeight: notif.read ? 400 : 600,
                          color: 'var(--text-primary)', marginBottom: 2,
                        }}>
                          {notif.title}
                        </div>
                        <div style={{
                          fontSize: '0.75rem', color: 'var(--text-secondary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {notif.message}
                        </div>
                        <div style={{
                          fontSize: '0.65rem', color: 'var(--text-muted)',
                          marginTop: 4, fontFamily: 'var(--font-mono)',
                        }}>
                          {timeAgo(notif.time)}
                        </div>
                      </div>
                      {!notif.read && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          flexShrink: 0, marginTop: 6,
                        }} />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
