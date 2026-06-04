import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bot, Palette, Bell, Key, Globe, Shield,
  Save, RotateCcw, Eye, EyeOff, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

function SettingsSection({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card"
      style={{ padding: '24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(61,127,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
          color: 'var(--text-primary)', margin: 0,
        }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function SettingsRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div className={`toggle-track ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </div>
  );
}

export default function SettingsView() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const settings = state.settings;
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const updateSetting = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
  };

  const updateNotification = (key, value) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { notifications: { ...settings.notifications, [key]: value } },
    });
  };

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      updateSetting('apiKey', apiKeyInput.trim());
      setApiKeyInput('');
    }
    toast.success('Settings saved successfully!');
  };

  const handleClearKey = () => {
    updateSetting('apiKey', '');
    setApiKeyInput('');
    toast.info('API key cleared');
  };

  const handleReset = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        botName: 'Nexus',
        personality: 50,
        responseStyle: 'balanced',
        companyName: 'VelocityHQ',
        fontSize: 'medium',
      },
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', overflow: 'auto', maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Customize your VelocityHQ experience
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Bot Settings */}
      <SettingsSection title="Bot Configuration" icon={Bot} delay={0.05}>
        <SettingsRow label="Bot Name" description="The name displayed in chat conversations">
          <input value={settings.botName}
            onChange={e => updateSetting('botName', e.target.value)}
            className="input-field" style={{ width: 180, textAlign: 'right' }} />
        </SettingsRow>
        <SettingsRow label="Company Name" description="Your company name for branded messages">
          <input value={settings.companyName}
            onChange={e => updateSetting('companyName', e.target.value)}
            className="input-field" style={{ width: 180, textAlign: 'right' }} />
        </SettingsRow>
        <SettingsRow label="Response Style" description="Controls how the bot communicates">
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: 3, border: '1px solid var(--border-subtle)' }}>
            {['concise', 'balanced', 'detailed'].map(style => (
              <button key={style}
                onClick={() => updateSetting('responseStyle', style)}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                  fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                  background: settings.responseStyle === style ? 'var(--accent-primary)' : 'transparent',
                  color: settings.responseStyle === style ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}>
                {style}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Personality" description="Adjust from professional to friendly">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 220 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pro</span>
            <input type="range" min="0" max="100" value={settings.personality}
              onChange={e => updateSetting('personality', parseInt(e.target.value))}
              style={{
                flex: 1, height: 4, appearance: 'none', background: 'var(--bg-elevated)',
                borderRadius: 2, outline: 'none', cursor: 'pointer',
                accentColor: 'var(--accent-primary)',
              }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fun</span>
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* API Settings */}
      <SettingsSection title="API Configuration" icon={Key} delay={0.1}>
        <SettingsRow label="Groq API Key" description="Connect to Groq for AI-powered responses">
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              className="input-field"
              style={{ width: 240, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              placeholder={
                settings.apiKey
                  ? (settings.apiKey.startsWith('gsk_') && settings.apiKey.length > 8
                      ? `gsk_••••••••${settings.apiKey.slice(-4)}`
                      : '••••••••••••••••')
                  : 'gsk_...'
              }
            />
            {apiKeyInput && (
              <button 
                className="btn-icon" 
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? "Hide input" : "Show input"}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {settings.apiKey && (
              <button 
                className="btn-icon" 
                onClick={handleClearKey} 
                title="Clear saved API key"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </SettingsRow>
        <div style={{
          marginTop: 12, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          background: settings.apiKey ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${settings.apiKey ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          fontSize: '0.8rem', color: settings.apiKey ? 'var(--accent-success)' : 'var(--accent-warning)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Shield size={14} />
          {settings.apiKey
            ? 'API key configured — Groq AI responses are active'
            : 'No API key — using smart fallback responses'}
        </div>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" icon={Palette} delay={0.15}>
        <SettingsRow label="Font Size" description="Adjust the base text size">
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: 3, border: '1px solid var(--border-subtle)' }}>
            {['small', 'medium', 'large'].map(size => (
              <button key={size}
                onClick={() => updateSetting('fontSize', size)}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: size === 'small' ? '0.72rem' : size === 'large' ? '0.88rem' : '0.8rem',
                  fontWeight: 500, fontFamily: 'var(--font-body)', textTransform: 'capitalize',
                  background: settings.fontSize === size ? 'var(--accent-primary)' : 'transparent',
                  color: settings.fontSize === size ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}>
                {size}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Accent Color" description="Primary accent color for the interface">
          <div style={{ display: 'flex', gap: 8 }}>
            {['#3D7FFF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
              <div key={color}
                onClick={() => updateSetting('accentColor', color)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  border: settings.accentColor === color ? '3px solid white' : '3px solid transparent',
                  boxShadow: settings.accentColor === color ? `0 0 12px ${color}80` : 'none',
                  transform: settings.accentColor === color ? 'scale(1.15)' : 'scale(1)',
                }} />
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" icon={Bell} delay={0.2}>
        <SettingsRow label="New Lead Alerts" description="Get notified when a new hot lead is detected">
          <Toggle value={settings.notifications.newLead} onChange={v => updateNotification('newLead', v)} />
        </SettingsRow>
        <SettingsRow label="Stage Changes" description="Notifications when deals move to a new stage">
          <Toggle value={settings.notifications.stageChange} onChange={v => updateNotification('stageChange', v)} />
        </SettingsRow>
        <SettingsRow label="Demo Bookings" description="Alert when a demo is scheduled by a prospect">
          <Toggle value={settings.notifications.demoBooked} onChange={v => updateNotification('demoBooked', v)} />
        </SettingsRow>
        <SettingsRow label="Negative Sentiment" description="Flag conversations with negative sentiment">
          <Toggle value={settings.notifications.negativeSentiment} onChange={v => updateNotification('negativeSentiment', v)} />
        </SettingsRow>
      </SettingsSection>

      {/* About */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{
          textAlign: 'center', padding: '32px 20px',
          color: 'var(--text-muted)', fontSize: '0.75rem',
        }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
          VelocityHQ Sales Bot
        </div>
        <div>v1.0.0 · Built with React + Vite · Powered by Groq AI</div>
      </motion.div>
    </motion.div>
  );
}
