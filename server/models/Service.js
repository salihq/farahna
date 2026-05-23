const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'fa-star'
  },
  color: {
    type: String,
    default: '#888'
  }
});

module.exports = mongoose.model('Service', serviceSchema);
