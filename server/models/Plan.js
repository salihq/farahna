const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },
  clientName: {
    type: String,
    default: 'عميل غير مسجل'
  },
  name: {
    type: String,
    default: 'خطة مقترحة'
  },
  dateStr: {
    type: String,
    required: true
  },
  vendorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  guests: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'completed', 'cancelled', 'draft'],
    default: 'confirmed'
  },
  totalCost: {
    type: Number,
    default: 0
  },
  bookedBy: {
    name: { type: String, default: '' },
    contacts: [{
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      role: { type: String, default: '' }
    }],
    source: {
      type: String,
      enum: ['website', 'external', 'organizer'],
      default: 'website'
    },
    notes: { type: String, default: '' }
  },
  eventType: {
    type: String,
    enum: ['زفاف', 'خطوبة', 'عقد قران', 'حفل تخرج', 'أخرى'],
    default: 'زفاف'
  },
  eventTime: {
    type: String,
    enum: ['مسائي', 'صباحي'],
    default: 'مسائي'
  },
  venue: {
    type: String,
    default: ''
  },
  specialRequests: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

planSchema.index({ status: 1 });
planSchema.index({ dateStr: 1 });

module.exports = mongoose.model('Plan', planSchema);
