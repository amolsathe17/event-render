const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  sponsorName: {
    type: String,
    required: true,
    trim: true
  },
  orgName: {
    type: String,
    trim: true,
    default: ''
  },
  sponsorType: {
    type: String,
    enum: [
      'Corporate',
      'CSR Funding',
      'Government',
      'Government Scheme',
      'Educational Institute',
      'NGO',
      'Trust / Foundation',
      'Individual',
      'Other'
    ],
    default: 'Corporate'
  },
  contactPerson: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  fundingDate: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Cheque', 'Demand Draft', 'Cash', 'Online Gateway', 'Other'],
    default: 'Bank Transfer'
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  purpose: {
    type: String,
    trim: true,
    default: ''
  },
  eventId: {
    type: String,
    required: true,
    default: 'all'
  },
  eventTitle: {
    type: String,
    default: 'All Events Combined'
  },
  category: {
    type: String,
    trim: true,
    default: 'General Sponsorship'
  },
  status: {
    type: String,
    enum: ['Received', 'Pending', 'Partially Received', 'Approved'],
    default: 'Received'
  },
  documentUrl: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sponsorship', sponsorshipSchema);
