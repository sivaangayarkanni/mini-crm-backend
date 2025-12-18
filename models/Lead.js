const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'new'
  },
  value: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  expectedCloseDate: {
    type: Date
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  notes: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);