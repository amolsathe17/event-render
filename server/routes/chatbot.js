const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const ChatbotSettings = require('../models/ChatbotSettings');

const {
  getEventInfo,
  getParticipantContext,
  getJudgeContext,
  getAdminContext
} = require('../services/chatbotDataService');

const { generateAIResponse } = require('../services/aiProvider');

// Helper to classify user message intent
const detectIntent = (message, role) => {
  const q = (message || '').toLowerCase();

  if (q.includes('rule') || q.includes('regulation') || q.includes('requirement')) return 'EVENT_RULES';
  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('package') || q.includes('pay fee')) return 'REGISTRATION_FEE';

  if (role === 'Participant') {
    if (q.includes('my payment') || q.includes('paid') || q.includes('transaction') || q.includes('payment status')) return 'MY_PAYMENT';
    if (q.includes('my submission') || q.includes('upload') || q.includes('photo') || q.includes('video') || q.includes('my entry')) return 'MY_SUBMISSION';
    if (q.includes('result') || q.includes('winner') || q.includes('rank') || q.includes('score')) return 'RESULTS';
    if (q.includes('certificate')) return 'CERTIFICATE';
    if (q.includes('event') || q.includes('venue') || q.includes('date') || q.includes('deadline') || q.includes('about')) return 'EVENT_DETAILS';
  }

  if (role === 'Judge') {
    if (q.includes('assigned') || q.includes('my event')) return 'JUDGE_ASSIGNED_EVENTS';
    if (q.includes('pending') || q.includes('how many') || q.includes('evaluate') || q.includes('submission')) return 'JUDGE_PENDING_EVALUATIONS';
    if (q.includes('criteria') || q.includes('grade') || q.includes('mark') || q.includes('score')) return 'JUDGE_CRITERIA';
  }

  if (role === 'Admin') {
    if (q.includes('financial') || q.includes('profit') || q.includes('loss') || q.includes('revenue') || q.includes('expense')) return 'ADMIN_FINANCIAL_SUMMARY';
    if (q.includes('csr') || q.includes('sponsor') || q.includes('donation') || q.includes('grant') || q.includes('funding') || q.includes('government')) return 'ADMIN_SPONSORSHIP_CSR';
    if (q.includes('participant') || q.includes('submission') || q.includes('stat') || q.includes('overview') || q.includes('total')) return 'ADMIN_EVENT_STATS';
  }

  return 'GENERAL_HELP';
};

const { evaluateSecurityAndPermission } = require('../services/chatbotSecurity');

// @route   POST /api/chatbot/message
// @desc    Process user question, enforce security & event scope, return verified AI response
// @access  Private
router.post('/message', protect, async (req, res) => {
  try {
    const { message, eventId = 'all' } = req.body;
    const user = req.user;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // Check Chatbot Settings
    let settings = await ChatbotSettings.findOne({ key: 'default' });
    if (!settings) {
      settings = await ChatbotSettings.create({ key: 'default' });
    }

    if (!settings.enabled) {
      return res.status(403).json({ success: false, message: 'Chatbot assistant is currently disabled by administrator.' });
    }

    if (user.role === 'Participant' && !settings.participantChatbot) {
      return res.status(403).json({ success: false, message: 'Participant chatbot assistant is disabled.' });
    }
    if (user.role === 'Judge' && !settings.judgeChatbot) {
      return res.status(403).json({ success: false, message: 'Judge chatbot assistant is disabled.' });
    }
    if (user.role === 'Admin' && !settings.adminChatbot) {
      return res.status(403).json({ success: false, message: 'Admin chatbot assistant is disabled.' });
    }

    // 1. Evaluate Security & Role Permission BEFORE Database Query
    const securityResult = evaluateSecurityAndPermission(message, user.role);

    if (!securityResult.allowed) {
      // Role Permission Check Failed! DO NOT QUERY CONFIDENTIAL DATABASE TABLES!
      const refusalMessage = securityResult.responseMessage;

      // Save History if enabled
      if (settings.storeChatHistory) {
        let session = await ChatSession.findOne({ userId: String(user._id), isActive: true });
        if (!session) {
          session = await ChatSession.create({
            userId: String(user._id),
            userName: user.name,
            role: user.role,
            eventId
          });
        }
        await ChatMessage.create({
          sessionId: session._id,
          sender: 'user',
          text: message.trim()
        });
        await ChatMessage.create({
          sessionId: session._id,
          sender: 'assistant',
          text: refusalMessage
        });
      }

      return res.json({
        success: true,
        intent: securityResult.intent,
        message: refusalMessage
      });
    }

    const intent = securityResult.intent;

    // 2. Retrieve Public Event Info
    const eventInfo = await getEventInfo(eventId);

    // 3. Retrieve Role-Restricted Context Data
    let participantData = null;
    let judgeData = null;
    let adminData = null;

    if (user.role === 'Participant') {
      participantData = await getParticipantContext(user, eventId);
    } else if (user.role === 'Judge') {
      judgeData = await getJudgeContext(user, eventId);
    } else if (user.role === 'Admin') {
      adminData = await getAdminContext(eventId);
    }

    // 4. Generate AI Response
    const aiResponseText = await generateAIResponse({
      intent,
      role: user.role,
      eventInfo,
      participantData,
      judgeData,
      adminData,
      userQuery: message.trim()
    });

    // 5. Save History if enabled
    if (settings.storeChatHistory) {
      let session = await ChatSession.findOne({ userId: String(user._id), isActive: true });
      if (!session) {
        session = await ChatSession.create({
          userId: String(user._id),
          userName: user.name,
          role: user.role,
          eventId
        });
      }

      await ChatMessage.create({
        sessionId: String(session._id),
        userId: String(user._id),
        sender: 'user',
        text: message.trim(),
        intent,
        eventId
      });

      await ChatMessage.create({
        sessionId: String(session._id),
        userId: String(user._id),
        sender: 'assistant',
        text: aiResponseText,
        intent,
        eventId
      });
    }

    return res.status(200).json({
      success: true,
      message: aiResponseText,
      intent,
      eventId
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: "I'm temporarily unable to retrieve this information. Please try again in a moment."
    });
  }
});

// @route   GET /api/chatbot/history
// @desc    Get user chat history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = req.user;
    const session = await ChatSession.findOne({ userId: String(user._id), isActive: true });
    if (!session) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await ChatMessage.find({ sessionId: String(session._id) }).sort({ createdAt: 1 }).limit(50);
    return res.status(200).json({
      success: true,
      messages: messages.map(m => ({
        id: String(m._id),
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp || m.createdAt
      }))
    });
  } catch (error) {
    console.error('Chatbot History Error:', error);
    return res.status(500).json({ success: false, message: 'Could not load chat history' });
  }
});

// @route   POST /api/chatbot/clear
// @desc    Clear active chat session
// @access  Private
router.post('/clear', protect, async (req, res) => {
  try {
    const user = req.user;
    await ChatSession.updateMany({ userId: String(user._id), isActive: true }, { isActive: false });
    return res.status(200).json({ success: true, message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Chatbot Clear Error:', error);
    return res.status(500).json({ success: false, message: 'Could not clear chat history' });
  }
});

// @route   GET /api/chatbot/settings
// @desc    Get admin chatbot settings
// @access  Private/Admin
router.get('/settings', protect, authorize('Admin'), async (req, res) => {
  try {
    let settings = await ChatbotSettings.findOne({ key: 'default' });
    if (!settings) {
      settings = await ChatbotSettings.create({ key: 'default' });
    }
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/chatbot/settings
// @desc    Update admin chatbot settings
// @access  Private/Admin
router.put('/settings', protect, authorize('Admin'), async (req, res) => {
  try {
    const { enabled, participantChatbot, judgeChatbot, adminChatbot, showQuickQuestions, storeChatHistory, welcomeMessage } = req.body;
    let settings = await ChatbotSettings.findOne({ key: 'default' });
    if (!settings) {
      settings = new ChatbotSettings({ key: 'default' });
    }

    if (typeof enabled === 'boolean') settings.enabled = enabled;
    if (typeof participantChatbot === 'boolean') settings.participantChatbot = participantChatbot;
    if (typeof judgeChatbot === 'boolean') settings.judgeChatbot = judgeChatbot;
    if (typeof adminChatbot === 'boolean') settings.adminChatbot = adminChatbot;
    if (typeof showQuickQuestions === 'boolean') settings.showQuickQuestions = showQuickQuestions;
    if (typeof storeChatHistory === 'boolean') settings.storeChatHistory = storeChatHistory;
    if (typeof welcomeMessage === 'string') settings.welcomeMessage = welcomeMessage;

    await settings.save();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
