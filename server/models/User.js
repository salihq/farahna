const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['organizer', 'vendor'],
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  serviceId: {
    type: String
  },
  price: {
    type: Number,
    default: 0
  },
  pricingType: {
    type: String,
    enum: ['flat', 'perPerson'],
    default: 'flat'
  },
  specialPricing: [{
    dateStr: String,
    price: Number
  }],
  dateForwardPricing: [{
    fromDate: String,
    surcharge: Number,
    label: String
  }],
  fridaySurcharge: {
    type: Number,
    default: 0
  },
  saturdaySurcharge: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  contacts: [{
    name: String,
    phone: String
  }],
  maxCapacity: {
    type: Number,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  description: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  photos: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ serviceId: 1 });

module.exports = mongoose.model('User', userSchema);
