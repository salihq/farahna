const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

// All routes require auth
router.use(auth);

// ─── GET /available/search — Find available vendors ─────────
// Must be defined BEFORE /:vendorId routes to avoid conflict
router.get('/available/search', async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    // Build vendor query
    const vendorQuery = { role: 'vendor' };
    if (serviceId && serviceId !== 'all') {
      vendorQuery.serviceId = serviceId;
    }

    // If date is provided, exclude booked vendors
    if (date) {
      const bookedEntries = await Booking.find({ dates: date });
      const bookedVendorIds = bookedEntries.map(b => b.vendorId.toString());
      if (bookedVendorIds.length > 0) {
        vendorQuery._id = { $nin: bookedVendorIds };
      }
    }

    const availableVendors = await User.find(vendorQuery).select('-password');
    res.json(availableVendors);
  } catch (err) {
    console.error('Search available vendors error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /:vendorId — Get booking dates for a vendor ────────
router.get('/:vendorId', async (req, res) => {
  try {
    if (!req.params.vendorId || req.params.vendorId === 'undefined') {
      return res.json({ dates: [] });
    }
    const booking = await Booking.findOne({ vendorId: req.params.vendorId });
    res.json({ dates: booking ? booking.dates : [] });
  } catch (err) {
    console.error('Get booking dates error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST /:vendorId/toggle — Toggle a date ─────────────────
router.post('/:vendorId/toggle', async (req, res) => {
  try {
    const { dateStr } = req.body;
    const { vendorId } = req.params;

    if (!dateStr) {
      return res.status(400).json({ error: 'التاريخ مطلوب' });
    }

    // Only the vendor themselves or an organizer can toggle
    const isOwner = req.user._id.toString() === vendorId;
    const isOrganizer = req.user.role === 'organizer';

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
    }

    let booking = await Booking.findOne({ vendorId });
    if (!booking) {
      booking = await Booking.create({ vendorId, dates: [] });
    }

    const dateIndex = booking.dates.indexOf(dateStr);
    if (dateIndex > -1) {
      // Remove the date
      booking.dates.splice(dateIndex, 1);
    } else {
      // Add the date
      booking.dates.push(dateStr);
    }

    await booking.save();
    res.json({ dates: booking.dates });
  } catch (err) {
    console.error('Toggle booking date error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
