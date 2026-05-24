const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dates: { type: [String], default: [] }
});

bookingSchema.index({ vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
