import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MessageSquare, Users, Package, DollarSign, Calendar,
  BarChart3, Settings, UserPlus, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const allActions = [
  { id: 'nav-chat', label: 'Go to Chat', icon: MessageSquare, category: 'Navigation', action: 'SET_VIEW', payload: 'chat' },
  { id: 'nav-leads', label: 'Go to Leads', icon: Users, category: 'Navigation', action: 'SET_VIEW', payload: 'leads' },
  { id: 'nav-products', label: 'Go to Products', icon: Package, category: 'Navigation', action: 'SET_VIEW', payload: 'products' },
  { id: 'nav-pipeline', label: 'Go to Pipeline', icon: DollarSign, category: 'Navigation', action: 'SET_VIEW', payload: 'pipeline' },
  { id: 'nav-scheduler', label: 'Go to Schedule', icon: Calendar, category: 'Navigation', action: 'SET_VIEW', payload: 'scheduler' },
  { id: 'nav-analytics', label: 'Go to Analytics', icon: BarChart3, category: 'Navigation', action: 'SET_VIEW', payload: 'analytics' },
  { id: 'nav-settings', label: 'Go to Settings', icon: Settings, category: 'Navigation', action: 'SET_VIEW', payload: 'settings' },
  { id: 'action-new-lead', label: 'Create New Lead', icon: UserPlus, category: 'Actions', action: 'SET_VIEW', payload: 'leads' },
  { id: 'action-schedule-demo', label: 'Schedule a Demo', icon: Calendar, category: 'Actions', action: 'SET_VIEW', payload: 'scheduler' },
  { id: 'action-view-analytics', label: 'View Analytics Dashboard', icon: BarChart3, category: 'Actions', action: 'SET_VIEW', payload: 'analytics' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { state, dispatch } = useApp();

  // Build items including leads
  const leadItems = state.leads.map(lead => ({
    id: `lead-${lead.id}`,
    label: `${lead.name} — ${lead.company}`,
    icon: Users,
    category: 'Leads',
    action: 'SET_VIEW',
    payload: 'leads',
  }));

  const allItems = [...allActions, ...leadItems];

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allActions;

  const handleSelect = useCallback((item) => {
    dispatch({ type: item.action, payload: item.payload });
    onClose();
    setQuery('');
    setSelectedIndex(0);
  }, [dispatch, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', paddingTop: '20vh',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 560, maxHeight: '60vh',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, leads, actions..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <kbd style={{
                background: 'var(--bg-elevated)', padding: '2px 6px',
                borderRadius: 4, fontSize: '0.7rem', color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ overflow: 'auto', flex: 1, padding: '8px' }}>
              {filtered.length === 0 ? (
                <div style={{
                  padding: '32px 20px', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '0.875rem',
                }}>
                  No results found
                </div>
              ) : (
                (() => {
                  let lastCategory = '';
                  return filtered.map((item, idx) => {
                    const Icon = item.icon;
                    const showCategory = item.category !== lastCategory;
                    lastCategory = item.category;
                    return (
                      <div key={item.id}>
                        {showCategory && (
                          <div style={{
                            padding: '8px 12px 4px',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {item.category}
                          </div>
                        )}
                        <button
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            background: idx === selectedIndex ? 'var(--bg-elevated)' : 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            fontFamily: 'var(--font-body)',
                            textAlign: 'left',
                            transition: 'background 0.1s ease',
                          }}
                        >
                          <Icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {idx === selectedIndex && (
                            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 16,
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
