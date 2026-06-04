import { createContext, useContext, useReducer, useMemo } from 'react';
import { mockLeads } from '../data/mockLeads';
import { mockDeals } from '../data/mockDeals';
import { mockBookings } from '../data/mockBookings';

const AppContext = createContext(null);

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialMessages = [
  {
    id: generateId(),
    role: 'assistant',
    content: "Hey there! I'm **Nexus**, your VelocityHQ sales assistant. I'm here to help you discover the right plan, get a product demo, or answer any questions you have.\n\nWhat brings you in today?",
    type: 'text',
    timestamp: new Date(),
    reactions: {},
  },
];

const initialNotifications = [
  {
    id: generateId(),
    type: 'lead',
    title: 'Hot lead detected',
    message: 'Layla Nguyen (FutureSoft) scored 95 — deal closing imminent',
    time: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
  },
  {
    id: generateId(),
    type: 'demo',
    title: 'Demo scheduled',
    message: 'Sarah Chen booked a 60-min Enterprise demo for tomorrow',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: generateId(),
    type: 'deal',
    title: 'Deal stage updated',
    message: 'Velocity AI Enterprise moved to Negotiation',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: generateId(),
    type: 'system',
    title: 'Weekly report ready',
    message: 'Your sales performance report for this week is available',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

const initialState = {
  // Navigation
  activeView: 'chat',

  // Chat
  messages: initialMessages,
  conversationStage: 'Awareness',
  sentiment: 'neutral',
  isTyping: false,
  activeLead: null,

  // Leads
  leads: mockLeads,
  selectedLeads: [],
  leadFilter: 'all',
  leadSearch: '',
  leadSort: 'score-desc',

  // Deals
  deals: mockDeals,

  // Bookings
  bookings: mockBookings,

  // Notifications
  notifications: initialNotifications,

  // Settings
  settings: {
    botName: 'Nexus',
    botGreeting: "Hey there! I'm **Nexus**, your VelocityHQ sales assistant.",
    personality: 50,
    responseStyle: 'balanced',
    companyName: 'VelocityHQ',
    theme: 'dark',
    accentColor: '#977DFF',
    fontSize: 'medium',
    apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    notifications: {
      newLead: true,
      stageChange: true,
      demoBooked: true,
      negativeSentiment: true,
    },
  },
};

function appReducer(state, action) {
  switch (action.type) {
    // Navigation
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };

    // Chat
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, { ...action.payload, id: action.payload.id || generateId() }] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_STAGE':
      return { ...state, conversationStage: action.payload };
    case 'SET_SENTIMENT':
      return { ...state, sentiment: action.payload };
    case 'REACT_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.messageId
            ? { ...m, reactions: { ...m.reactions, [action.payload.reaction]: !m.reactions?.[action.payload.reaction] } }
            : m
        ),
      };
    case 'SET_ACTIVE_LEAD':
      return { ...state, activeLead: action.payload };

    // Leads
    case 'ADD_LEAD':
      return { ...state, leads: [{ ...action.payload, id: generateId(), createdAt: new Date(), lastContact: new Date(), notes: [], conversationId: generateId() }, ...state.leads] };
    case 'UPDATE_LEAD':
      return { ...state, leads: state.leads.map(l => l.id === action.payload.id ? { ...l, ...action.payload } : l) };
    case 'DELETE_LEAD':
      return { ...state, leads: state.leads.filter(l => l.id !== action.payload) };
    case 'DELETE_LEADS':
      return { ...state, leads: state.leads.filter(l => !action.payload.includes(l.id)), selectedLeads: [] };
    case 'SET_LEAD_FILTER':
      return { ...state, leadFilter: action.payload };
    case 'SET_LEAD_SEARCH':
      return { ...state, leadSearch: action.payload };
    case 'SET_LEAD_SORT':
      return { ...state, leadSort: action.payload };
    case 'TOGGLE_LEAD_SELECT':
      return {
        ...state,
        selectedLeads: state.selectedLeads.includes(action.payload)
          ? state.selectedLeads.filter(id => id !== action.payload)
          : [...state.selectedLeads, action.payload],
      };
    case 'CLEAR_LEAD_SELECTION':
      return { ...state, selectedLeads: [] };
    case 'ADD_LEAD_NOTE':
      return {
        ...state,
        leads: state.leads.map(l =>
          l.id === action.payload.leadId
            ? { ...l, notes: [...l.notes, { text: action.payload.text, date: new Date() }] }
            : l
        ),
      };

    // Deals
    case 'ADD_DEAL':
      return { ...state, deals: [{ ...action.payload, id: generateId(), createdAt: new Date(), lastActivity: new Date() }, ...state.deals] };
    case 'UPDATE_DEAL':
      return { ...state, deals: state.deals.map(d => d.id === action.payload.id ? { ...d, ...action.payload, lastActivity: new Date() } : d) };
    case 'MOVE_DEAL':
      return {
        ...state,
        deals: state.deals.map(d =>
          d.id === action.payload.dealId ? { ...d, stage: action.payload.stage, lastActivity: new Date() } : d
        ),
      };
    case 'DELETE_DEAL':
      return { ...state, deals: state.deals.filter(d => d.id !== action.payload) };

    // Bookings
    case 'ADD_BOOKING':
      return { ...state, bookings: [{ ...action.payload, id: generateId() }, ...state.bookings] };
    case 'UPDATE_BOOKING':
      return { ...state, bookings: state.bookings.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) };
    case 'CANCEL_BOOKING':
      return { ...state, bookings: state.bookings.map(b => b.id === action.payload ? { ...b, status: 'cancelled' } : b) };

    // Notifications
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [{ ...action.payload, id: generateId(), time: new Date(), read: false }, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    // Settings
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
