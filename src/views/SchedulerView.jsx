import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Plus, Video, Phone, Monitor,
  CheckCircle, XCircle, AlertCircle, User, MapPin, Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/global/Modal';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'var(--accent-success)', icon: CheckCircle, bg: 'rgba(16,185,129,0.12)' },
  pending: { label: 'Pending', color: 'var(--accent-warning)', icon: AlertCircle, bg: 'rgba(245,158,11,0.12)' },
  cancelled: { label: 'Cancelled', color: 'var(--accent-danger)', icon: XCircle, bg: 'rgba(239,68,68,0.12)' },
  completed: { label: 'Completed', color: 'var(--accent-primary)', icon: CheckCircle, bg: 'rgba(61,127,255,0.12)' },
};

const typeConfig = {
  zoom: { label: 'Zoom', icon: Video, color: '#2D8CFF' },
  meet: { label: 'Google Meet', icon: Monitor, color: '#34d399' },
  phone: { label: 'Phone Call', icon: Phone, color: '#fbbf24' },
};

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatFullDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function isToday(date) {
  const d = new Date(date);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function isFuture(date) {
  return new Date(date).getTime() > Date.now();
}

export default function SchedulerView() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [newBooking, setNewBooking] = useState({
    contactName: '', company: '', email: '',
    date: '', time: '10:00', duration: 30,
    type: 'zoom', topic: '', salesRep: 'Alex Morgan',
  });

  const filteredBookings = state.bookings
    .filter(b => {
      if (filter === 'upcoming') return isFuture(b.date) && b.status !== 'cancelled';
      if (filter === 'past') return !isFuture(b.date);
      if (filter === 'cancelled') return b.status === 'cancelled';
      return true;
    })
    .sort((a, b) => {
      if (filter === 'past') return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

  const handleAddBooking = () => {
    if (!newBooking.contactName || !newBooking.date) {
      toast.warning('Contact name and date are required');
      return;
    }
    dispatch({
      type: 'ADD_BOOKING',
      payload: { ...newBooking, date: new Date(newBooking.date), status: 'confirmed' },
    });
    toast.success(`Demo with ${newBooking.contactName} scheduled!`);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'demo',
        title: 'Demo scheduled',
        message: `${newBooking.contactName} (${newBooking.company}) — ${newBooking.topic}`,
      },
    });
    setNewBooking({
      contactName: '', company: '', email: '',
      date: '', time: '10:00', duration: 30,
      type: 'zoom', topic: '', salesRep: 'Alex Morgan',
    });
    setShowAddModal(false);
  };

  const upcoming = state.bookings.filter(b => isFuture(b.date) && b.status !== 'cancelled');
  const todayCount = state.bookings.filter(b => isToday(b.date) && b.status !== 'cancelled').length;

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit"
      style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Demo Scheduler
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {upcoming.length} upcoming · {todayCount} today
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Schedule Demo
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'var(--accent-primary)' },
          { label: 'Today', value: todayCount, icon: Clock, color: 'var(--accent-success)' },
          { label: 'This Week', value: state.bookings.filter(b => {
            const d = new Date(b.date);
            const now = new Date();
            const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
            return d >= now && d <= weekEnd && b.status !== 'cancelled';
          }).length, icon: Calendar, color: 'var(--accent-secondary)' },
          { label: 'Completed', value: state.bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'var(--accent-warning)' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card-sm"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
        {['upcoming', 'past', 'cancelled', 'all'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '8px 16px', border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
              fontFamily: 'var(--font-body)', textTransform: 'capitalize',
              background: filter === f ? 'var(--accent-primary)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {filteredBookings.map((booking, idx) => {
            const sCfg = statusConfig[booking.status];
            const tCfg = typeConfig[booking.type] || typeConfig.zoom;
            const StatusIcon = sCfg.icon;
            const TypeIcon = tCfg.icon;
            const today = isToday(booking.date);

            return (
              <motion.div key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card-sm"
                style={{
                  padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 20,
                  border: today ? '1px solid rgba(61,127,255,0.3)' : undefined,
                  position: 'relative', overflow: 'hidden',
                }}>

                {today && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                    background: 'var(--accent-primary)',
                  }} />
                )}

                {/* Date */}
                <div style={{
                  width: 56, textAlign: 'center', flexShrink: 0,
                  padding: '8px', background: 'var(--bg-elevated)', borderRadius: 12,
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    {new Date(booking.date).getDate()}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.contactName}</span>
                    {today && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>TODAY</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {booking.topic}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {booking.time} · {booking.duration}min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TypeIcon size={12} style={{ color: tCfg.color }} /> {tCfg.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={12} /> {booking.salesRep}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  background: sCfg.bg, flexShrink: 0,
                }}>
                  <StatusIcon size={14} style={{ color: sCfg.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: sCfg.color }}>{sCfg.label}</span>
                </div>

                {/* Cancel button for upcoming */}
                {booking.status === 'confirmed' && isFuture(booking.date) && (
                  <button className="btn-icon"
                    onClick={() => { dispatch({ type: 'CANCEL_BOOKING', payload: booking.id }); toast.info('Booking cancelled'); }}
                    title="Cancel booking"
                    style={{ flexShrink: 0 }}>
                    <XCircle size={16} style={{ color: 'var(--accent-danger)' }} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredBookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>No {filter} demos found</div>
          </div>
        )}
      </div>

      {/* Add Booking Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Schedule Demo" maxWidth={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Contact Name *</label>
              <input value={newBooking.contactName} onChange={e => setNewBooking(p => ({ ...p, contactName: e.target.value }))} className="input-field" placeholder="Sarah Chen" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Company</label>
              <input value={newBooking.company} onChange={e => setNewBooking(p => ({ ...p, company: e.target.value }))} className="input-field" placeholder="TechCorp" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Email</label>
            <input value={newBooking.email} onChange={e => setNewBooking(p => ({ ...p, email: e.target.value }))} className="input-field" placeholder="sarah@techcorp.io" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Topic</label>
            <input value={newBooking.topic} onChange={e => setNewBooking(p => ({ ...p, topic: e.target.value }))} className="input-field" placeholder="Enterprise CRM Demo" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Date *</label>
              <input type="date" value={newBooking.date} onChange={e => setNewBooking(p => ({ ...p, date: e.target.value }))}
                className="input-field" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Time</label>
              <input type="time" value={newBooking.time} onChange={e => setNewBooking(p => ({ ...p, time: e.target.value }))}
                className="input-field" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Duration</label>
              <select value={newBooking.duration} onChange={e => setNewBooking(p => ({ ...p, duration: parseInt(e.target.value) }))} className="input-field">
                <option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Type</label>
              <select value={newBooking.type} onChange={e => setNewBooking(p => ({ ...p, type: e.target.value }))} className="input-field">
                <option value="zoom">Zoom</option><option value="meet">Google Meet</option><option value="phone">Phone</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Sales Rep</label>
              <select value={newBooking.salesRep} onChange={e => setNewBooking(p => ({ ...p, salesRep: e.target.value }))} className="input-field">
                <option>Alex Morgan</option><option>Jordan Lee</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
            onClick={handleAddBooking}>
            <Calendar size={16} /> Schedule Demo
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
