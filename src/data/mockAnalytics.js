const today = new Date();

function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Seed-based pseudo-random for consistent data
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateAnalyticsData() {
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const seed = i + 42;
    return {
      date: formatDate(subDays(today, 29 - i)),
      shortDate: subDays(today, 29 - i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      chats: Math.floor(seededRandom(seed) * 30) + 15,
      leads: Math.floor(seededRandom(seed + 100) * 12) + 3,
      conversions: Math.floor(seededRandom(seed + 200) * 5) + 1,
      positive: +(seededRandom(seed + 300) * 0.4 + 0.4).toFixed(2),
      neutral: +(seededRandom(seed + 400) * 0.3 + 0.2).toFixed(2),
      negative: +(seededRandom(seed + 500) * 0.15 + 0.05).toFixed(2),
      responseTime: Math.floor(seededRandom(seed + 600) * 45) + 5,
    };
  });

  const totalChats = dailyData.reduce((sum, d) => sum + d.chats, 0);
  const totalLeads = dailyData.reduce((sum, d) => sum + d.leads, 0);
  const totalConversions = dailyData.reduce((sum, d) => sum + d.conversions, 0);
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;

  const kpis = {
    totalChats: { value: totalChats, trend: 12, label: 'Total Chats' },
    totalLeads: { value: totalLeads, trend: 23, label: 'Leads Captured' },
    conversionRate: { value: parseFloat(conversionRate), trend: 5, label: 'Conversion Rate', suffix: '%' },
    pipelineValue: { value: 284400, trend: 18, label: 'Pipeline Value', prefix: '$', format: 'compact' },
  };

  const leadSources = [
    { name: 'Chatbot', value: 38, color: 'var(--accent-primary)' },
    { name: 'Website', value: 24, color: 'var(--accent-secondary)' },
    { name: 'LinkedIn', value: 20, color: 'var(--accent-success)' },
    { name: 'Referral', value: 12, color: 'var(--accent-warning)' },
    { name: 'Other', value: 6, color: 'var(--text-muted)' },
  ];

  const conversionFunnel = [
    { stage: 'Visitors', count: 12400, percentage: 100 },
    { stage: 'Engaged', count: 3720, percentage: 30 },
    { stage: 'Leads', count: 890, percentage: 7.2 },
    { stage: 'Qualified', count: 356, percentage: 2.9 },
    { stage: 'Proposals', count: 142, percentage: 1.1 },
    { stage: 'Closed', count: 67, percentage: 0.54 },
  ];

  const topIntents = [
    { intent: 'Pricing Inquiry', count: 156, percentage: 28 },
    { intent: 'Product Features', count: 134, percentage: 24 },
    { intent: 'Demo Request', count: 98, percentage: 18 },
    { intent: 'Technical Support', count: 72, percentage: 13 },
    { intent: 'Integration Help', count: 51, percentage: 9 },
    { intent: 'Billing Questions', count: 45, percentage: 8 },
  ];

  const responseTimeDistribution = [
    { range: '<5s', count: 145, color: 'var(--accent-success)' },
    { range: '5-15s', count: 210, color: 'var(--accent-primary)' },
    { range: '15-30s', count: 85, color: 'var(--accent-warning)' },
    { range: '30-60s', count: 42, color: 'var(--accent-danger)' },
    { range: '>60s', count: 18, color: 'var(--text-muted)' },
  ];

  return {
    dailyData,
    kpis,
    leadSources,
    conversionFunnel,
    topIntents,
    responseTimeDistribution,
  };
}
