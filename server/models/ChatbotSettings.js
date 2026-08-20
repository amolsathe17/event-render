const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const chatbotSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  enabled: { type: Boolean, default: true },
  participantChatbot: { type: Boolean, default: true },
  judgeChatbot: { type: Boolean, default: true },
  adminChatbot: { type: Boolean, default: true },
  showQuickQuestions: { type: Boolean, default: true },
  storeChatHistory: { type: Boolean, default: true },
  welcomeMessage: {
    type: String,
    default: 'Hello! I am your Event Assistant. How can I help you today?'
  }
}, { timestamps: true });

module.exports = getModel('ChatbotSettings', chatbotSettingsSchema);
