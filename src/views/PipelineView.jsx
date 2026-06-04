import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, GripVertical, MoreHorizontal, Plus, ChevronRight,
  Clock, User, Flag, Trash2, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { pipelineStages } from '../data/mockDeals';
import Modal from '../components/global/Modal';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const stageColors = {
  'Lead': 'var(--text-muted)',
  'Qualified': 'var(--accent-primary)',
  'Proposal': 'var(--accent-secondary)',
  'Negotiation': 'var(--accent-warning)',
  'Closed Won': 'var(--accent-success)',
  'Closed Lost': 'var(--accent-danger)',
};

const priorityConfig = {
  hot: { label: 'Hot', color: '#f87171' },
  normal: { label: '● Normal', color: 'var(--text-muted)' },
  low: { label: '↓ Low', color: 'var(--accent-primary)' },
};

function daysUntil(date) {
  const d = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Today';
  return `${d}d`;
}

export default function PipelineView() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [hoveredStage, setHoveredStage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newDeal, setNewDeal] = useState({
    title: '', company: '', contactName: '', value: '', probability: 50,
    stage: 'Lead', priority: 'normal', notes: '',
  });

  const dealsByStage = useMemo(() => {
    const map = {};
    pipelineStages.forEach(stage => { map[stage] = []; });
    state.deals.forEach(deal => {
      if (map[deal.stage]) map[deal.stage].push(deal);
    });
    return map;
  }, [state.deals]);

  const totalPipeline = state.deals
    .filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  const weightedPipeline = state.deals
    .filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

  const handleDrop = (stage) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      dispatch({ type: 'MOVE_DEAL', payload: { dealId: draggedDeal.id, stage } });
      toast.success(`Moved "${draggedDeal.title}" to ${stage}`);
    }
    setDraggedDeal(null);
    setHoveredStage(null);
  };

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.company) {
      toast.warning('Title and company are required');
      return;
    }
    dispatch({
      type: 'ADD_DEAL',
      payload: {
        ...newDeal,
        value: parseInt(newDeal.value) || 0,
        expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assignedTo: 'Alex Morgan',
        tags: [],
      },
    });
    toast.success(`Deal "${newDeal.title}" created!`);
    setNewDeal({ title: '', company: '', contactName: '', value: '', probability: 50, stage: 'Lead', priority: 'normal', notes: '' });
    setShowAddModal(false);
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Deal Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {state.deals.length} deals · Pipeline: <span style={{ color: 'var(--accent-success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              ${totalPipeline.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
              Weighted: <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                ${Math.round(weightedPipeline).toLocaleString()}
              </span>
            </span>
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {/* Pipeline Board */}
      <div style={{
        flex: 1, display: 'flex', gap: 12, overflow: 'auto',
        paddingBottom: 8,
      }}>
        {pipelineStages.map((stage) => {
          const deals = dealsByStage[stage] || [];
          const stageValue = deals.reduce((s, d) => s + d.value, 0);
          const isHovered = hoveredStage === stage;
          const stageColor = stageColors[stage];

          return (
            <div key={stage}
              onDragOver={e => { e.preventDefault(); setHoveredStage(stage); }}
              onDragLeave={() => setHoveredStage(null)}
              onDrop={() => handleDrop(stage)}
              style={{
                flex: 1, minWidth: 240, maxWidth: 320,
                display: 'flex', flexDirection: 'column',
                background: isHovered ? 'rgba(61,127,255,0.04)' : 'transparent',
                borderRadius: 'var(--radius-lg)',
                border: isHovered ? '2px dashed var(--accent-primary)' : '2px dashed transparent',
                transition: 'all 0.2s ease',
                padding: 4,
              }}>
              {/* Stage Header */}
              <div style={{
                padding: '12px 14px', marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: stageColor }} />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    {stage}
                  </span>
                  <span style={{
                    background: 'var(--bg-elevated)', padding: '1px 8px', borderRadius: 999,
                    fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                  }}>{deals.length}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  ${stageValue.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards */}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '0 2px' }}>
                <AnimatePresence>
                  {deals.map((deal, idx) => {
                    const pri = priorityConfig[deal.priority] || priorityConfig.normal;
                    const daysLeft = daysUntil(deal.expectedClose);
                    const isOverdue = daysLeft.includes('overdue');

                    return (
                      <motion.div key={deal.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.03 }}
                        draggable
                        onDragStart={() => setDraggedDeal(deal)}
                        onDragEnd={() => { setDraggedDeal(null); setHoveredStage(null); }}
                        onClick={() => setSelectedDeal(deal)}
                        className="glass-card-sm"
                        style={{
                          padding: '14px', cursor: 'grab',
                          opacity: draggedDeal?.id === deal.id ? 0.5 : 1,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = 'translateY(0)'; }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {deal.title}
                          </div>
                          <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                          {deal.company} · {deal.contactName}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                            color: 'var(--accent-success)',
                          }}>
                            ${deal.value.toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '0.7rem', color: pri.color, fontWeight: 500,
                          }}>{pri.label}</span>
                        </div>

                        {/* Probability Bar */}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Probability</span>
                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{deal.probability}%</span>
                          </div>
                          <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${deal.probability}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{
                                height: '100%', borderRadius: 2,
                                background: deal.probability >= 70 ? 'var(--accent-success)' : deal.probability >= 40 ? 'var(--accent-primary)' : 'var(--accent-warning)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', marginTop: 10,
                          fontSize: '0.65rem', color: 'var(--text-muted)',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> <span style={{ color: isOverdue ? 'var(--accent-danger)' : undefined, fontWeight: isOverdue ? 600 : 400 }}>{daysLeft}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={10} /> {deal.assignedTo?.split(' ')[0]}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {deals.length === 0 && (
                  <div style={{
                    padding: 24, textAlign: 'center', color: 'var(--text-muted)',
                    fontSize: '0.8rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  }}>
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Modal */}
      <Modal isOpen={!!selectedDeal} onClose={() => setSelectedDeal(null)} title={selectedDeal?.title} maxWidth={480}>
        {selectedDeal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Company</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedDeal.company}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Contact</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedDeal.contactName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Value</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-success)', fontSize: '1.1rem' }}>
                  ${selectedDeal.value.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Probability</div>
                <div style={{ fontWeight: 600 }}>{selectedDeal.probability}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Stage</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px',
                  borderRadius: 999, background: `${stageColors[selectedDeal.stage]}20`,
                  color: stageColors[selectedDeal.stage], fontWeight: 600, fontSize: '0.8rem',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: stageColors[selectedDeal.stage] }} />
                  {selectedDeal.stage}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Expected Close</div>
                <div style={{ fontSize: '0.9rem' }}>{new Date(selectedDeal.expectedClose).toLocaleDateString()}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                {selectedDeal.notes || 'No notes'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-danger)' }}
                onClick={() => { dispatch({ type: 'DELETE_DEAL', payload: selectedDeal.id }); setSelectedDeal(null); toast.info('Deal deleted'); }}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setSelectedDeal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Deal Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Deal" maxWidth={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Deal Title *</label>
            <input value={newDeal.title} onChange={e => setNewDeal(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Enterprise CRM Upgrade" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Company *</label>
              <input value={newDeal.company} onChange={e => setNewDeal(p => ({ ...p, company: e.target.value }))} className="input-field" placeholder="Acme Inc" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Contact Name</label>
              <input value={newDeal.contactName} onChange={e => setNewDeal(p => ({ ...p, contactName: e.target.value }))} className="input-field" placeholder="John Smith" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Value ($)</label>
              <input type="number" value={newDeal.value} onChange={e => setNewDeal(p => ({ ...p, value: e.target.value }))} className="input-field" placeholder="10000" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Stage</label>
              <select value={newDeal.stage} onChange={e => setNewDeal(p => ({ ...p, stage: e.target.value }))} className="input-field">
                {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Priority</label>
              <select value={newDeal.priority} onChange={e => setNewDeal(p => ({ ...p, priority: e.target.value }))} className="input-field">
                <option value="hot">Hot</option><option value="normal">Normal</option><option value="low">Low</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            onClick={handleAddDeal}>
            <Plus size={16} /> Create Deal
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
