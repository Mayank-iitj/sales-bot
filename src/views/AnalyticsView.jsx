import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, MessageSquare, Users,
  Target, DollarSign, Clock, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { generateAnalyticsData } from '../data/mockAnalytics';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const tooltipStyle = {
  background: '#0F1629',
  border: '1px solid rgba(61,127,255,0.3)',
  borderRadius: 10,
  padding: '8px 14px',
  fontSize: '0.8rem',
  color: '#F1F5FF',
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

function KPICard({ kpi, icon: Icon, color, delay }) {
  const value = useAnimatedCounter(kpi.value, 1200);
  const isUp = kpi.trend > 0;

  let displayValue;
  if (kpi.format === 'compact') {
    displayValue = `${kpi.prefix || ''}${(value / 1000).toFixed(0)}K`;
  } else if (kpi.suffix === '%') {
    displayValue = `${value.toFixed(1)}${kpi.suffix}`;
  } else {
    displayValue = `${kpi.prefix || ''}${Math.round(value).toLocaleString()}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card"
      style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{kpi.label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}>{displayValue}</span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.75rem', fontWeight: 600,
            color: isUp ? 'var(--accent-success)' : 'var(--accent-danger)',
          }}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isUp ? '+' : ''}{kpi.trend}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsView() {
  const data = useMemo(() => generateAnalyticsData(), []);
  const { dailyData, kpis, leadSources, conversionFunnel, topIntents, responseTimeDistribution } = data;

  const kpiIcons = [MessageSquare, Users, Target, DollarSign];
  const kpiColors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-success)', 'var(--accent-gold)'];

  // Only show every 5th label
  const chartData = dailyData.map((d, i) => ({
    ...d,
    displayDate: i % 5 === 0 ? d.shortDate : '',
  }));

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', overflow: 'auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Last 30 days performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {Object.values(kpis).map((kpi, idx) => (
          <KPICard key={kpi.label} kpi={kpi} icon={kpiIcons[idx]} color={kpiColors[idx]} delay={idx * 0.06} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Chat & Lead Volume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
            Chat & Lead Volume
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#977DFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#977DFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: '#4A5578' }}
                tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5578' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="chats" stroke="#977DFF" strokeWidth={2}
                fillOpacity={1} fill="url(#colorChats)" name="Chats" />
              <Area type="monotone" dataKey="leads" stroke="#8B5CF6" strokeWidth={2}
                fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lead Sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
            Lead Sources
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={leadSources} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={50} outerRadius={75} paddingAngle={4} strokeWidth={0}>
                {leadSources.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {leadSources.map((src) => (
              <div key={src.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: src.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{src.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{src.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
            Conversion Funnel
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {conversionFunnel.map((step, idx) => {
              const colors = ['var(--accent-primary)', '#5591ff', 'var(--accent-secondary)', '#a78bfa', 'var(--accent-success)', '#34d399'];
              return (
                <div key={step.stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 70, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                    {step.stage}
                  </span>
                  <div style={{ flex: 1, height: 24, background: 'var(--bg-elevated)', borderRadius: 6, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.35 + idx * 0.08, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: 6,
                        background: colors[idx],
                        minWidth: step.percentage > 0 ? 24 : 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                      }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'white', fontWeight: 700 }}>
                        {step.count.toLocaleString()}
                      </span>
                    </motion.div>
                  </div>
                  <span style={{ width: 40, fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {step.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Response Time Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
            Response Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={responseTimeDistribution}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#4A5578' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#4A5578' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                {responseTimeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Intents */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>
          🎯 Top Customer Intents
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {topIntents.map((intent, idx) => (
            <motion.div key={intent.intent}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.04 }}
              style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(61,127,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
                color: 'var(--accent-primary)',
              }}>#{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{intent.intent}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--bg-surface)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${intent.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.6 + idx * 0.05 }}
                      style={{ height: '100%', borderRadius: 2, background: 'var(--accent-primary)' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {intent.count}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
