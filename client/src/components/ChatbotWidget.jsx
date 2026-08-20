import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, X, Send, Trash2, Sparkles, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';

export default function ChatbotWidget() {
  const { user, apiFetch } = useAuth();
  const { selectedEventId, selectedEvent, allEvents } = useEvent();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Role-based quick questions
  const getQuickQuestions = () => {
    if (!user) return [];
    if (user.role === 'Participant') {
      return [
        'Rules & Regulations',
        'Registration Fee',
        'My Payment Status',
        'My Submission Status',
        'Results',
        'Certificate'
      ];
    }
    if (user.role === 'Judge') {
      return [
        'My Assigned Events',
        'Pending Evaluations',
        'Judging Criteria'
      ];
    }
    if (user.role === 'Admin') {
      return [
        'Financial Summary',
        'Sponsorship & CSR Funding',
        'Event Overview'
      ];
    }
    return ['Event Details', 'Rules & Regulations'];
  };

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen, user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const loadHistory = async () => {
    try {
      const data = await apiFetch('/api/chatbot/history');
      if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            text: `Hello ${user?.name || 'there'}! 👋 I am your **Event Assistant**.\nHow can I help you with **${selectedEvent ? selectedEvent.title : 'the contest'}** today?`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.warn('Could not load chatbot history:', err);
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hello ${user?.name || 'there'}! 👋 I am your **Event Assistant**.\nAsk me anything about rules, fees, submissions, evaluations, or reports!`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setErrorMsg('');
    const userMsgObj = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          eventId: selectedEventId || 'all'
        })
      });

      if (response.success && response.message) {
        setMessages(prev => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: response.message,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setErrorMsg(err.message || 'Unable to connect to assistant');
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ I'm temporarily unable to retrieve this information. Please try again in a moment.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear active chat history?')) return;
    try {
      await apiFetch('/api/chatbot/clear', { method: 'POST' });
    } catch (err) {
      console.warn('Clear history error:', err);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat history cleared. How can I assist you now?`,
        timestamp: new Date()
      }
    ]);
  };

  // Render markdown-like bold and code formatting cleanly
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Format bold (**text**)
      const parts = line.split(/(\*\*.*?\*\*|\`.*?\`)/g);

      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{part.slice(1, -1)}</code>;
        }
        return part;
      });

      return (
        <p key={idx} className={`${line.startsWith('•') || line.startsWith('📌') || line.startsWith('💳') || line.startsWith('📸') || line.startsWith('🏆') || line.startsWith('💼') || line.startsWith('🏛️') || line.startsWith('📊') ? 'mt-1 font-medium' : 'mt-0.5'}`}>
          {lineContent}
        </p>
      );
    });
  };

  // If user is not logged in, chatbot is hidden to maintain auth security
  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-5 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-indigo-400/30"
          aria-label="Open Event Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-white animate-bounce-subtle" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
          </div>

          <span className="font-display font-black text-xs sm:text-sm tracking-wide">
            Event Assistant
          </span>

          <span className="hidden sm:inline-block px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            AI
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 h-[520px] max-h-[82vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 border-b border-indigo-900/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-linear-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md border border-indigo-400/30">
                <Bot size={20} className="text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-sm text-white tracking-tight">Event Assistant</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[9px] font-extrabold uppercase">
                    Online
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-300">
                  <span className="truncate max-w-[170px] font-semibold text-indigo-200">
                    {selectedEvent ? selectedEvent.title : 'All Events Combined'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 rounded-full font-bold">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Question Pills */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
              Quick:
            </span>
            {getQuickQuestions().map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Conversation Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  <div
                    className={`mt-1.5 text-[9px] font-semibold text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Bot size={15} />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-3 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">Checking event database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask about ${selectedEvent ? selectedEvent.title : 'your event'}...`}
                disabled={loading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all font-medium disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
