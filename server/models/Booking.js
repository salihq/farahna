const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dates: [{
    dateStr: { type: String, required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    manualBlock: { type: Boolean, default: false }
  }]
});

bookingSchema.index({ vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
