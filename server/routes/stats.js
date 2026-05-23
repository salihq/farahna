const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Client = require('../models/Client');
const Plan = require('../models/Plan');
const Service = require('../models/Service');
const ActivityLog = require('../models/ActivityLog');

// ─── GET /services — Get all services (all authenticated users) ──
router.get('/services', auth, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    console.error('Get services error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST /activity — Log an activity (all authenticated users) ──
router.post('/activity', auth, async (req, res) => {
  try {
    const { type, message } = req.body;
    const entry = await ActivityLog.create({ type: type || 'system', message });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Log activity error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// All remaining routes require auth + organizer role
router.use(auth, requireRole('organizer'));

// ─── GET /dashboard — Aggregate stats ───────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [totalVendors, totalClients, totalPlans, activePlans, revenueResult, totalServices, upcomingWeddings] = await Promise.all([
      User.countDocuments({ role: 'vendor' }),
      Client.countDocuments(),
      Plan.countDocuments(),
      Plan.countDocuments({ status: 'active' }),
      Plan.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]),
      Service.countDocuments(),
      Plan.countDocuments({
        status: 'active',
        date: { $gte: new Date().toISOString().split('T')[0] }
      })
    ]);

    res.json({
      totalVendors,
      totalClients,
      totalPlans,
      activePlans,
      totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
      totalServices,
      upcomingWeddings
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /breakdown — Per-service breakdown ──────────────────
router.get('/breakdown', async (req, res) => {
  try {
    const services = await Service.find();
    const breakdown = [];

    for (const service of services) {
      const serviceId = service._id.toString();

      const vendors = await User.find({ role: 'vendor', serviceId });
      const vendorIds = vendors.map(v => v._id);

      const bookingCount = await Plan.countDocuments({
        vendorIds: { $in: vendorIds },
        status: { $ne: 'cancelled' }
      });

      const avgPrice = vendors.length > 0
        ? vendors.reduce((sum, v) => sum + (v.price || 0), 0) / vendors.length
        : 0;

      breakdown.push({
        service: {
          _id: service._id,
          name: service.name,
          icon: service.icon,
          color: service.color
        },
        vendorCount: vendors.length,
        bookingCount,
        avgPrice: Math.round(avgPrice)
      });
    }

    res.json(breakdown);
  } catch (err) {
    console.error('Breakdown stats error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /monthly — Monthly booking counts ──────────────────
router.get('/monthly', async (req, res) => {
  try {
    const monthly = await Plan.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(monthly.map(m => ({
      month: m._id,
      count: m.count
    })));
  } catch (err) {
    console.error('Monthly stats error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /top-vendors — Top vendors by booking count ────────
router.get('/top-vendors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topVendors = await Plan.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$vendorIds' },
      {
        $group: {
          _id: '$vendorIds',
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $project: {
          _id: '$vendor._id',
          name: '$vendor.name',
          serviceId: '$vendor.serviceId',
          rating: '$vendor.rating',
          price: '$vendor.price',
          bookingCount: 1
        }
      }
    ]);

    res.json(topVendors);
  } catch (err) {
    console.error('Top vendors error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /activity — Recent activity log ────────────────────
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await ActivityLog.find().sort({ date: -1 }).limit(limit);
    res.json(activities);
  } catch (err) {
    console.error('Activity log error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
