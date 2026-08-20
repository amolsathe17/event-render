const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const chatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  role: { type: String, enum: ['Participant', 'Judge', 'Admin'], default: 'Participant' },
  eventId: { type: String, default: 'all' },
  title: { type: String, default: 'Event Assistant Chat' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = getModel('ChatSession', chatSessionSchema);
