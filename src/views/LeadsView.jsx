import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Trash2, Filter, ArrowUpDown, Mail, Phone,
  Building2, Star, ChevronDown, MoreHorizontal, X, StickyNote, Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/global/Modal';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const tempBadge = {
  hot:  { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: '● Hot' },
  warm: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: '● Warm' },
  cold: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: '● Cold' },
};

function ScoreRing({ score, size = 40 }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-elevated)" strokeWidth="3" fill="none" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="3" fill="none"
        strokeDasharray={c} initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill="var(--text-primary)" fontSize="11" fontWeight="700"
        fontFamily="var(--font-mono)" style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {score}
      </text>
    </svg>
  );
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LeadsView() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedLead, setExpandedLead] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', role: '', phone: '', source: 'Chatbot', temperature: 'warm', score: 50 });

  const sortedLeads = useMemo(() => {
    let filtered = [...state.leads];

    // Filter
    if (state.leadFilter !== 'all') {
      filtered = filtered.filter(l => l.temperature === state.leadFilter);
    }

    // Search
    if (state.leadSearch) {
      const q = state.leadSearch.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }

    // Sort
    const [key, dir] = state.leadSort.split('-');
    filtered.sort((a, b) => {
      const aVal = key === 'score' ? a.score : key === 'name' ? a.name : new Date(a.lastContact).getTime();
      const bVal = key === 'score' ? b.score : key === 'name' ? b.name : new Date(b.lastContact).getTime();
      if (typeof aVal === 'string') return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return dir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [state.leads, state.leadFilter, state.leadSearch, state.leadSort]);

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      toast.warning('Name and email are required');
      return;
    }
    dispatch({ type: 'ADD_LEAD', payload: { ...newLead, dealValue: 0, stage: 'Awareness', tags: [] } });
    toast.success(`Lead "${newLead.name}" created!`);
    setNewLead({ name: '', email: '', company: '', role: '', phone: '', source: 'Chatbot', temperature: 'warm', score: 50 });
    setShowAddModal(false);
  };

  const handleDeleteSelected = () => {
    dispatch({ type: 'DELETE_LEADS', payload: state.selectedLeads });
    toast.info(`Deleted ${state.selectedLeads.length} lead(s)`);
  };

  const handleAddNote = (leadId) => {
    if (!noteText.trim()) return;
    dispatch({ type: 'ADD_LEAD_NOTE', payload: { leadId, text: noteText.trim() } });
    setNoteText('');
    toast.success('Note added');
  };

  const filters = [
    { id: 'all', label: 'All Leads', count: state.leads.length },
    { id: 'hot', label: '● Hot', count: state.leads.filter(l => l.temperature === 'hot').length },
    { id: 'warm', label: '● Warm', count: state.leads.filter(l => l.temperature === 'warm').length },
    { id: 'cold', label: '● Cold', count: state.leads.filter(l => l.temperature === 'cold').length },
  ];

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Lead Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {state.leads.length} total leads · {state.leads.filter(l => l.temperature === 'hot').length} hot opportunities
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {state.selectedLeads.length > 0 && (
            <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="btn-ghost" onClick={handleDeleteSelected}
              style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <Trash2 size={16} /> Delete ({state.selectedLeads.length})
            </motion.button>
          )}
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={state.leadSearch}
            onChange={e => dispatch({ type: 'SET_LEAD_SEARCH', payload: e.target.value })}
            placeholder="Search leads..."
            className="input-field"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f.id}
              onClick={() => dispatch({ type: 'SET_LEAD_FILTER', payload: f.id })}
              style={{
                padding: '6px 14px', borderRadius: 999, border: '1px solid',
                borderColor: state.leadFilter === f.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: state.leadFilter === f.id ? 'rgba(61,127,255,0.12)' : 'transparent',
                color: state.leadFilter === f.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontWeight: state.leadFilter === f.id ? 600 : 400,
                transition: 'all 0.15s ease',
              }}>
              {f.label} <span style={{ opacity: 0.6 }}>({f.count})</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={state.leadSort}
          onChange={e => dispatch({ type: 'SET_LEAD_SORT', payload: e.target.value })}
          className="input-field"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>
          <option value="score-desc">Score ↓</option>
          <option value="score-asc">Score ↑</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="lastContact-desc">Recent</option>
        </select>
      </div>

      {/* Leads List */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {sortedLeads.map((lead, idx) => {
            const badge = tempBadge[lead.temperature];
            const isExpanded = expandedLead === lead.id;
            const isSelected = state.selectedLeads.includes(lead.id);

            return (
              <motion.div key={lead.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-card-sm"
                style={{
                  padding: 0, overflow: 'hidden',
                  border: isSelected ? '1px solid var(--accent-primary)' : undefined,
                }}>
                {/* Main Row */}
                <div
                  onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    cursor: 'pointer', transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Checkbox */}
                  <div onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_LEAD_SELECT', payload: lead.id }); }}
                    style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                    }}>
                    {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                  </div>

                  {/* Score */}
                  <ScoreRing score={lead.score} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lead.name}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem',
                        fontWeight: 500, background: badge.bg, color: badge.color,
                      }}>{badge.label}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', gap: 12, marginTop: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={12} /> {lead.company}</span>
                      <span>{lead.role}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{lead.source}</span>
                    </div>
                  </div>

                  {/* Deal Value */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-success)' }}>
                      ${lead.dealValue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {timeAgo(lead.lastContact)}
                    </div>
                  </div>

                  <ChevronDown size={16} style={{
                    color: 'var(--text-muted)', transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }} />
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{
                        padding: '16px 20px', borderTop: '1px solid var(--border-subtle)',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                      }}>
                        {/* Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                            <Mail size={14} style={{ color: 'var(--text-muted)' }} /> {lead.email}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                            <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {lead.phone}
                          </div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            {lead.tags.map(tag => (
                              <span key={tag} style={{
                                padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem',
                                background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                              }}><Tag size={10} style={{ marginRight: 3 }} />{tag}</span>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflow: 'auto' }}>
                            {lead.notes.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No notes yet</span>}
                            {lead.notes.map((note, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                                {note.text}
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                                  {new Date(note.date).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <input value={noteText} onChange={e => setNoteText(e.target.value)}
                              placeholder="Add a note..." className="input-field" style={{ fontSize: '0.8rem' }}
                              onKeyDown={e => e.key === 'Enter' && handleAddNote(lead.id)} />
                            <button className="btn-primary" style={{ padding: '8px 12px' }}
                              onClick={() => handleAddNote(lead.id)}>
                              <StickyNote size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedLeads.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No leads match your filters</div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Lead" maxWidth={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Full Name *</label>
              <input value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="John Smith" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Email *</label>
              <input value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} className="input-field" placeholder="john@company.com" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Company</label>
              <input value={newLead.company} onChange={e => setNewLead(p => ({ ...p, company: e.target.value }))} className="input-field" placeholder="Acme Inc" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Role</label>
              <input value={newLead.role} onChange={e => setNewLead(p => ({ ...p, role: e.target.value }))} className="input-field" placeholder="Sales Manager" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Source</label>
              <select value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} className="input-field">
                <option>Chatbot</option><option>Website</option><option>LinkedIn</option><option>Referral</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Temperature</label>
              <select value={newLead.temperature} onChange={e => setNewLead(p => ({ ...p, temperature: e.target.value }))} className="input-field">
                <option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Score</label>
              <input type="number" min="0" max="100" value={newLead.score}
                onChange={e => setNewLead(p => ({ ...p, score: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            onClick={handleAddLead}>
            <Plus size={16} /> Create Lead
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
