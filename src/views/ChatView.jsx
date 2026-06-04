import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, MoreVertical, Search, Download, Wifi, WifiOff,
  Smile, Meh, Frown, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGroqAPI } from '../hooks/useGroqAPI';
import { analyzeSentiment, sentimentConfig } from '../hooks/useSentiment';
import { useToast } from '../context/ToastContext';

const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
};

const stages = ['Awareness', 'Discovery', 'Evaluation', 'Intent', 'Closing', 'Scheduled'];

const quickActions = [
  { label: 'View Products', action: 'products' },
  { label: 'Get Pricing', action: 'pricing' },
  { label: 'Book Demo', action: 'demo' },
  { label: 'Current Deals', action: 'deals' },
  { label: 'Track Order', action: 'track' },
  { label: 'Speak to Human', action: 'human' },
];

export default function ChatView() {
  const { state, dispatch } = useApp();
  const { sendMessage, detectStage } = useGroqAPI();
  const toast = useToast();
  const [inputValue, setInputValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [state.messages, state.isTyping]);

  const simulateStreaming = useCallback((fullText, msgId) => {
    let i = 0;
    const interval = setInterval(() => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: msgId, content: fullText.slice(0, i) }
      });
      i += 3;
      if (i >= fullText.length) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { id: msgId, content: fullText }
        });
        clearInterval(interval);
      }
    }, 15);
  }, [dispatch]);

  const handleSend = useCallback(async (text = null) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    setInputValue('');

    // Add user message
    const userMsg = {
      role: 'user',
      content: messageText,
      type: 'text',
      timestamp: new Date(),
      reactions: {},
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });

    // Analyze sentiment
    const newSentiment = analyzeSentiment(messageText);
    dispatch({ type: 'SET_SENTIMENT', payload: newSentiment });

    // Update stage
    const newStage = detectStage(messageText, state.conversationStage);
    if (newStage !== state.conversationStage) {
      dispatch({ type: 'SET_STAGE', payload: newStage });
    }

    // Show typing
    dispatch({ type: 'SET_TYPING', payload: true });

    // Get response
    const allMessages = [...state.messages, userMsg];
    const botMsgId = Math.random().toString(36).substr(2, 9);

    if (state.settings.apiKey) {
      // Create empty bot message
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: new Date(),
        reactions: {},
      };
      dispatch({ type: 'ADD_MESSAGE', payload: botMsg });

      try {
        let hasDeactivatedTyping = false;
        await sendMessage(
          allMessages,
          state.settings.apiKey,
          state.activeLead,
          state.conversationStage,
          (streamedText) => {
            if (!hasDeactivatedTyping) {
              dispatch({ type: 'SET_TYPING', payload: false });
              hasDeactivatedTyping = true;
            }
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: { id: botMsgId, content: streamedText }
            });
          }
        );
        dispatch({ type: 'SET_TYPING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_TYPING', payload: false });
        console.error('Streaming error:', error);
      }
    } else {
      const response = await sendMessage(allMessages, state.settings.apiKey, state.activeLead, state.conversationStage);
      dispatch({ type: 'SET_TYPING', payload: false });

      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: new Date(),
        reactions: {},
      };
      dispatch({ type: 'ADD_MESSAGE', payload: botMsg });
      simulateStreaming(response, botMsgId);
    }
  }, [inputValue, state.messages, state.conversationStage, state.settings.apiKey, state.activeLead, dispatch, sendMessage, detectStage, simulateStreaming]);

  const handleQuickAction = (action) => {
    const actionMessages = {
      products: "I'd like to learn about your products",
      pricing: "Can you tell me about your pricing plans?",
      demo: "I'd like to schedule a demo",
      deals: "What deals do you have going on?",
      track: "Can you help me track my order?",
      human: "I'd like to speak with a human agent",
    };
    handleSend(actionMessages[action] || action);
  };

  const handleExportChat = () => {
    const text = state.messages.map(m => {
      const time = new Date(m.timestamp).toLocaleString();
      const sender = m.role === 'user' ? 'You' : state.settings.botName;
      return `[${time}] ${sender}: ${m.content}`;
    }).join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported successfully!');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sentCfg = sentimentConfig[state.sentiment];
  const stageIdx = stages.indexOf(state.conversationStage);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {state.settings.botName}
              <span className="status-dot" style={{
                width: 8, height: 8, borderRadius: '50%',
                background: state.settings.apiKey ? 'var(--accent-success)' : 'var(--accent-warning)',
                display: 'inline-block',
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {state.settings.apiKey ? 'Connected to Groq API' : 'Using smart fallback responses'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn-icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button className="btn-icon" onClick={handleExportChat} title="Export chat">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div style={{ padding: '8px 24px' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="input-field"
                autoFocus
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <AnimatePresence>
          {state.messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isHighlighted = searchQuery && msg.content.toLowerCase().includes(searchQuery.toLowerCase());

            return (
              <motion.div
                key={msg.id || idx}
                initial={isUser ? { opacity: 0, x: 30, scale: 0.95 } : { opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: 10,
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 4,
                  }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser
                    ? 'linear-gradient(135deg, var(--accent-primary), #2563eb)'
                    : 'var(--bg-glass)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  backdropFilter: isUser ? 'none' : 'blur(20px)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  boxShadow: isHighlighted ? '0 0 0 2px var(--accent-warning)' : 'none',
                  position: 'relative',
                }}>
                  {/* Parse markdown-like bold */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: isUser ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)',
                    marginTop: 6,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {Object.entries(msg.reactions).filter(([, v]) => v).map(([reaction]) => (
                        <span key={reaction} style={{
                          fontSize: '0.75rem', padding: '2px 6px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: 999,
                        }}>
                          {reaction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {state.isTyping && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', gap: 10 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Bot size={16} color="white" />
              </div>
              <div className="glass-card-sm" style={{
                padding: '14px 20px',
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity, duration: 0.6,
                      delay, ease: 'easeInOut',
                    }}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--accent-primary)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Context Bar */}
      <div style={{
        padding: '8px 24px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Stage Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Stage:</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {stages.map((s, i) => (
                <div
                  key={s}
                  title={s}
                  style={{
                    width: 24, height: 4, borderRadius: 2,
                    background: i <= stageIdx ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              {state.conversationStage}
            </span>
          </div>

          {/* Sentiment */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 999,
            background: sentCfg.bg,
          }}>
            {(() => {
              const IconComponent = {
                positive: Smile,
                neutral: Meh,
                negative: Frown,
                urgent: AlertCircle
              }[state.sentiment] || Meh;
              return <IconComponent size={14} style={{ color: sentCfg.color }} />;
            })()}
            <span style={{ color: sentCfg.color, fontWeight: 500 }}>{sentCfg.label}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 4, overflow: 'auto' }}>
          {quickActions.slice(0, 3).map(qa => (
            <button
              key={qa.action}
              onClick={() => handleQuickAction(qa.action)}
              style={{
                padding: '4px 10px', borderRadius: 999,
                border: '1px solid var(--border-subtle)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-active)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-end',
        }}>
          <div style={{
            flex: 1, position: 'relative',
          }}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                resize: 'none',
                minHeight: 44,
                maxHeight: 120,
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: [1, 0.88, 1.08, 1] }}
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || state.isTyping}
            style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: inputValue.trim() ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              border: 'none',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
