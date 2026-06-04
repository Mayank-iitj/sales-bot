import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, Zap, ArrowRight, ChevronDown, ChevronUp, 
  PenLine, BarChart3, RefreshCw, GraduationCap, Rocket 
} from 'lucide-react';
import { plans, addOns, featureComparison } from '../data/mockProducts';
import { useToast } from '../context/ToastContext';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const addonIconMap = {
  PenLine,
  BarChart3,
  RefreshCw,
  GraduationCap,
  Rocket
};

export default function ProductsView() {
  const toast = useToast();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);

  const priceFactor = billingPeriod === 'annual' ? 0.8 : 1;

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', overflow: 'auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          Plans & Pricing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '8px 0 24px' }}>
          Choose the perfect plan for your revenue team
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 999, padding: 4,
        }}>
          <button onClick={() => setBillingPeriod('monthly')} style={{
            padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 500,
            background: billingPeriod === 'monthly' ? 'var(--accent-primary)' : 'transparent',
            color: billingPeriod === 'monthly' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}>Monthly</button>
          <button onClick={() => setBillingPeriod('annual')} style={{
            padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontFamily: 'var(--font-body)', fontWeight: 500,
            background: billingPeriod === 'annual' ? 'var(--accent-primary)' : 'transparent',
            color: billingPeriod === 'annual' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Annual
            <span style={{
              background: 'rgba(16,185,129,0.2)', color: '#34d399',
              padding: '1px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
            }}>-20%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24, maxWidth: 1100, margin: '0 auto 40px',
      }}>
        {plans.map((plan, idx) => (
          <motion.div key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="glass-card"
            style={{
              padding: 0, overflow: 'hidden', position: 'relative',
              border: plan.recommended ? '2px solid var(--accent-primary)' : undefined,
            }}>
            {plan.recommended && (
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white', textAlign: 'center', padding: '6px 0',
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
              }}>
                ★ MOST POPULAR
              </div>
            )}
            <div style={{ padding: '28px 24px' }}>
              {/* Plan badge */}
              {plan.badge && !plan.recommended && (
                <span className="badge badge-purple" style={{ marginBottom: 12 }}>{plan.badge}</span>
              )}

              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem',
                margin: '0 0 6px', color: 'var(--text-primary)',
              }}>{plan.name}</h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                {plan.price ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      ${Math.round(plan.price * priceFactor)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/mo</span>
                    {billingPeriod === 'annual' && (
                      <span style={{ color: 'var(--accent-success)', fontSize: '0.75rem', marginLeft: 8, fontWeight: 600 }}>
                        Save ${Math.round(plan.price * 12 * 0.2)}/yr
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    Custom Pricing
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => toast.success(`${plan.name} plan selected!`)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: plan.recommended ? 'none' : '1px solid var(--border-subtle)',
                  background: plan.recommended ? 'var(--accent-primary)' : 'transparent',
                  color: plan.recommended ? 'white' : 'var(--text-primary)',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                  marginBottom: 24,
                }}
                onMouseEnter={e => {
                  if (plan.recommended) { e.currentTarget.style.background = '#5591ff'; e.currentTarget.style.boxShadow = 'var(--glow-blue)'; }
                  else { e.currentTarget.style.background = 'var(--bg-elevated)'; }
                }}
                onMouseLeave={e => {
                  if (plan.recommended) { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.boxShadow = 'none'; }
                  else { e.currentTarget.style.background = 'transparent'; }
                }}>
                {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                <ArrowRight size={16} />
              </button>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <Check size={14} style={{ color: plan.color, flexShrink: 0 }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add-Ons */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} style={{ color: 'var(--accent-primary)' }} /> Power-Up Add-Ons
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {addOns.map((addon, idx) => {
            const IconComponent = addonIconMap[addon.icon];
            return (
              <motion.div key={addon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="glass-card-sm"
                style={{ padding: '20px', display: 'flex', gap: 14, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {IconComponent && <IconComponent size={20} style={{ color: 'var(--accent-primary)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{addon.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>{addon.description}</div>
                  <div style={{ fontValue: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                    ${addon.price}<span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>/{addon.period}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: 16 }}>
          {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showComparison ? 'Hide' : 'View'} Detailed Feature Comparison
        </button>

        {showComparison && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Feature</th>
                  {plans.map(p => (
                    <th key={p.id} style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: p.color }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{row.feature}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.85rem', color: row.starter === '✓' ? 'var(--accent-success)' : row.starter === '—' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{row.starter}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.85rem', color: row.pro === '✓' ? 'var(--accent-success)' : row.pro === '—' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{row.pro}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.85rem', color: row.enterprise === '✓' ? 'var(--accent-success)' : row.enterprise === '—' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
