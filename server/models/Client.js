const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  expectedGuests: {
    type: Number,
    default: 100
  },
  budget: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'booked', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', clientSchema);
