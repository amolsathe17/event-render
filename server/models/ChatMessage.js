const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String, required: true },
  sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  text: { type: String, required: true },
  intent: { type: String, default: 'GENERAL' },
  eventId: { type: String, default: 'all' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = getModel('ChatMessage', chatMessageSchema);
