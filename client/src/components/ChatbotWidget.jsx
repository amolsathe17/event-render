import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, X, Send, Trash2, Sparkles, AlertCircle, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ChatbotWidget() {
  const { user, apiFetch } = useAuth();
  const { selectedEventId, setSelectedEventId, selectedEvent, allEvents } = useEvent();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);
  const quickScrollRef = useRef(null);

  const scrollQuickQuestions = (direction) => {
    if (quickScrollRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      quickScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  const [exportingPdf, setExportingPdf] = useState(false);

  const handleSelectEventAndAsk = (eventId, questionText) => {
    setSelectedEventId(eventId);
    handleSendMessage(questionText, eventId);
  };

  const handleSendMessage = async (textToSend, overrideEventId) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const currentEventId = overrideEventId || selectedEventId || 'all';

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

    // If 'all' events is selected and user asks event-dependent question, prompt event selection
    // (Judge and Admin quick role queries bypass event selection prompt to return exact status for selected/combined events)
    const isEventSpecificQuery = [
      'rule', 'fee', 'payment', 'submission', 'result', 'certificate', 'pending', 'financial', 'sponsor', 'csr', 'assigned'
    ].some(k => text.toLowerCase().includes(k));

    const isJudgeQuery = user?.role === 'Judge' && (
      text.toLowerCase().includes('assigned') || 
      text.toLowerCase().includes('pending') || 
      text.toLowerCase().includes('evaluat')
    );

    const isAdminQuery = user?.role === 'Admin' && (
      text.toLowerCase().includes('financial') || 
      text.toLowerCase().includes('sponsor') || 
      text.toLowerCase().includes('csr') || 
      text.toLowerCase().includes('overview') || 
      text.toLowerCase().includes('stat')
    );

    if (!isJudgeQuery && !isAdminQuery && currentEventId === 'all' && isEventSpecificQuery && Array.isArray(allEvents) && allEvents.length > 0) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: `⚠️ **Event Selection Required**\n\nTo view exact details for **"${text}"**, please select a specific contest from the **Event Context** dropdown above, or click one of the contests below:`,
            isEventPrompt: true,
            pendingQuestion: text,
            timestamp: new Date()
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const response = await apiFetch('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          eventId: currentEventId
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

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRequestClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = async () => {
    setShowClearConfirm(false);
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

  const parseMarkdownForPDF = (text) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 600; color: #000000;">$1</span>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #000000;">$1</em>')
      .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 11px; color: #000000;">$1</code>');

    const lines = html.split('\n');
    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return `<div style="margin-top: 2px; margin-bottom: 2px; padding-left: 8px; color: #000000; font-weight: 400;">${trimmed}</div>`;
      }
      return `<div style="margin-top: 2px; margin-bottom: 2px; color: #000000; font-weight: 400;">${line}</div>`;
    }).join('');
  };

  const handleSavePDF = async () => {
    if (!messages || messages.length === 0) {
      alert('No messages to save.');
      return;
    }

    const eventTitle = selectedEvent ? selectedEvent.title : 'All Events Combined';
    const fileName = `Event_Assistant_Chat_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const generatedDateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let logoBase64 = '/sumbacontest.jpg';
    try {
      const logoRes = await fetch('/sumbacontest.jpg');
      if (logoRes.ok) {
        const logoBlob = await logoRes.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve('/sumbacontest.jpg');
          reader.readAsDataURL(logoBlob);
        });
      }
    } catch (e) {
      console.warn('Logo load error:', e);
    }

    const msgsPerPage = 8;
    const totalPages = Math.max(1, Math.ceil(messages.length / msgsPerPage));
    const pagesHtml = [];

    for (let p = 0; p < totalPages; p++) {
      const pageMsgs = messages.slice(p * msgsPerPage, (p + 1) * msgsPerPage);

      const pageMsgsHtml = pageMsgs.map(msg => {
        const isUser = msg.sender === 'user';
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const parsedContent = parseMarkdownForPDF(msg.text);

        const promptContestsHtml = msg.isEventPrompt && Array.isArray(allEvents) && allEvents.length > 0 ? `
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #000000;">
            <div style="font-weight: 600; margin-bottom: 3px; color: #000000;">Available Contests:</div>
            ${allEvents.map(ev => `<div style="margin-top: 2px; font-weight: 400; color: #000000;">• ${ev.title}</div>`).join('')}
          </div>
        ` : '';

        return `
          <div style="margin-bottom: 14px; padding: 10px 14px; background-color: #ffffff; border-left: 3px solid ${isUser ? '#4338ca' : '#0f172a'}; border-bottom: 1px solid #f1f5f9;">
            <div style="font-size: 10.5px; font-weight: 700; color: ${isUser ? '#4338ca' : '#0f172a'}; margin-bottom: 4px;">
              ${isUser ? `${user?.name || 'User'} (${user?.role || 'User'})` : 'Event Assistant (AI)'} • ${time}
            </div>
            <div style="font-size: 11.5px; color: #000000; font-weight: 400; line-height: 1.5; font-family: 'Segoe UI', Arial, sans-serif;">
              ${parsedContent}
              ${promptContestsHtml}
            </div>
          </div>
        `;
      }).join('');

      const headerHtml = `
        <div style="width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${logoBase64}" style="height: 52px; width: auto; object-fit: contain; display: block; border-radius: 4px;" alt="Logo" />
            <div>
              <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; line-height: 1.2;">SUMBARAN ART SOCIETY</h1>
              <p style="font-size: 10px; color: #475569; margin: 3px 0 0 0; font-weight: 600;">Official AI Event Assistant Chat Transcript</p>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; border: 2px solid #0f172a; color: #0f172a; padding: 6px 14px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase;">CHAT TRANSCRIPT</span>
            <p style="font-size: 9.5px; color: #475569; margin: 6px 0 0 0; font-weight: 600;">Generated: ${generatedDateStr}</p>
          </div>
        </div>
      `;

      const metadataHtml = p === 0 ? `
        <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px; background-color: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">EVENT CONTEXT</span>
            <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 3px 0 0 0;">${eventTitle}</h2>
            <p style="font-size: 11.5px; color: #4338ca; margin: 3px 0 0 0; font-weight: 800;">User: ${user?.name || 'User'} (${user?.role || 'User'})</p>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; border: 1.5px solid #4338ca; color: #4338ca; background-color: #eef2ff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800;">
              ${messages.length} Messages
            </span>
          </div>
        </div>
      ` : '';

      const footerHtml = `
        <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; color: #64748b; font-size: 9.5px; font-weight: 600;">
          <div>DSLR Photography Contest & Event Portal — Sumbaran Art Society Official Transcript</div>
          <div style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 5px 12px; border-radius: 6px; font-size: 9.5px; font-weight: 800;">
            Page ${p + 1} of ${totalPages}
          </div>
        </div>
      `;

      pagesHtml.push(`
        <div class="pdf-page-sheet" style="width: 210mm; min-height: 297mm; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; background: #ffffff; page-break-after: ${p < totalPages - 1 ? 'always' : 'auto'};">
          <div>
            ${headerHtml}
            ${metadataHtml}
            <div style="margin-top: 10px;">
              ${pageMsgsHtml}
            </div>
          </div>
          ${footerHtml}
        </div>
      `);
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.zIndex = '-9999';
    container.style.opacity = '0.01';
    container.style.pointerEvents = 'none';
    container.style.backgroundColor = '#ffffff';
    container.style.fontFamily = "'Segoe UI', Arial, sans-serif";
    container.style.color = '#0f172a';
    container.style.boxSizing = 'border-box';
    container.innerHTML = pagesHtml.join('');

    document.body.appendChild(container);

    try {
      setExportingPdf(true);
      const pageElements = container.querySelectorAll('.pdf-page-sheet');
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) doc.addPage();
        const canvas = await html2canvas(pageElements[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      document.body.removeChild(container);

      // Trigger direct download via Blob URL for universal browser compatibility
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('PDF export error:', err);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      alert('Could not export PDF transcript: ' + (err.message || 'Unknown error'));
    } finally {
      setExportingPdf(false);
    }
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
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center p-3 bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 ease-out cursor-pointer border border-indigo-400/30 overflow-hidden"
          aria-label="Open Event Assistant"
          title="Event Assistant AI"
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <Bot size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
          </div>

          <div className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2.5 flex items-center gap-2 transition-all duration-300 ease-out whitespace-nowrap overflow-hidden">
            <span className="font-display font-black text-xs sm:text-sm tracking-wide">
              Event Assistant
            </span>

            <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              AI
            </span>
          </div>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 h-[520px] max-h-[82vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 border-b border-indigo-900/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 bg-linear-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md border border-indigo-400/30 shrink-0">
                <Bot size={20} className="text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-sm text-white tracking-tight truncate">Event Assistant</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[9px] font-extrabold uppercase shrink-0">
                    Online
                  </span>
                </div>
                <div className="text-[10px] text-indigo-200/80 font-bold truncate mt-0.5">
                  Role: <span className="text-white font-extrabold">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleRequestClear}
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

          {/* Event Context Selector Sub-Bar */}
          <div className="px-3.5 py-1.5 bg-slate-900/90 dark:bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Event Context:</span>
            <select
              value={selectedEventId || 'all'}
              onChange={(e) => setSelectedEventId(e.target.value)}
              aria-label="Select Event Context"
              className="bg-indigo-950/80 hover:bg-indigo-900 text-indigo-100 text-[11px] font-bold py-1 px-2.5 rounded-xl border border-indigo-500/40 focus:outline-none cursor-pointer max-w-[210px] truncate shadow-2xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Events Combined</option>
              {allEvents.map((ev) => (
                <option key={ev._id} value={ev._id} className="bg-slate-900 text-white">
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Inline Clear History Confirmation Card inside Chat Box */}
          {showClearConfirm && (
            <div className="mx-3.5 my-2 p-3.5 bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700 rounded-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 shrink-0 shadow-md">
              {/* Entire Purple Pill is a Clickable Button to Save Chat as PDF */}
              <button
                type="button"
                onClick={handleSavePDF}
                disabled={exportingPdf}
                className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl flex items-center justify-between transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-black">
                  <FileDown size={17} className="text-indigo-200 shrink-0" />
                  <span>Save Chat History as PDF</span>
                </div>
                <span className="px-3 py-1 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-extrabold shadow-2xs transition-colors shrink-0">
                  {exportingPdf ? 'Exporting...' : 'Download PDF'}
                </span>
              </button>

              <div className="border-t border-amber-200 dark:border-amber-800/80 pt-2 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Clear active chat history?</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/80 font-medium">
                  This will permanently clear all messages in your current conversation.
                </p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmClearHistory}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Yes, Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Question Pills with Back and Forward Navigation Arrows */}
          <div className="px-2 py-2 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollQuickQuestions('left')}
              title="Scroll left"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              ref={quickScrollRef}
              className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 scroll-smooth"
            >
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

            <button
              type="button"
              onClick={() => scrollQuickQuestions('right')}
              title="Scroll right"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
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

                  {/* Interactive Contest Pills if Event Selection Required (Left-aligned) */}
                  {msg.isEventPrompt && Array.isArray(allEvents) && allEvents.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-col gap-1.5 w-full">
                      {allEvents.map((ev) => (
                        <button
                          key={ev._id}
                          type="button"
                          onClick={() => handleSelectEventAndAsk(ev._id, msg.pendingQuestion || 'Rules & Regulations')}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 bg-indigo-50/90 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="shrink-0 text-sm">🏆</span>
                          <span className="text-left font-bold">{ev.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

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

            {/* PDF Exporting Indicator */}
            {exportingPdf && (
              <div className="mx-3 my-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700/80 rounded-2xl flex items-center gap-2.5 animate-pulse text-indigo-900 dark:text-indigo-200 text-xs font-bold shrink-0">
                <FileDown size={18} className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
                <span>Generating official PDF transcript download...</span>
              </div>
            )}

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
