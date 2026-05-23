const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['6months', '3months', '1month', '1week', 'dayof', 'other'],
    default: 'other'
  },
  planId: {
    type: String,
    default: 'template'
  },
  done: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Checklist', checklistSchema);
