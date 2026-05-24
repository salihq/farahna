const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');

// ─── GET / — All vendors ────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (err) {
    console.error('Get vendors error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /:id — Single vendor ───────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');
    if (!vendor) {
      return res.status(404).json({ error: 'المزوّد غير موجود' });
    }
    res.json(vendor);
  } catch (err) {
    console.error('Get vendor error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST / — Create vendor (organizer only) ────────────────
router.post('/', auth, requireRole('organizer'), async (req, res) => {
  try {
    const { name, email, password, phone, serviceId, price, pricingType, maxCapacity, description, photos } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'vendor',
      phone: phone || '',
      serviceId,
      price: price || 0,
      pricingType: pricingType || 'flat',
      maxCapacity: maxCapacity || null,
      description: description || '',
      photos: photos || []
    });

    // Create associated booking document
    await Booking.create({ vendorId: vendor._id, dates: [] });

    // Log activity
    await ActivityLog.create({
      type: 'vendor',
      message: 'تم إضافة مزوّد جديد: ' + vendor.name
    });

    const vendorObj = vendor.toObject();
    delete vendorObj.password;

    res.status(201).json(vendorObj);
  } catch (err) {
    console.error('Create vendor error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /:id — Update vendor ───────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'price', 'pricingType', 'maxCapacity', 'description', 'photos', 'serviceId', 'location', 'contacts', 'specialPricing', 'fridaySurcharge', 'saturdaySurcharge'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.user.role === 'vendor') {
      delete updates.name;
      delete updates.serviceId;
    }

    const vendor = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!vendor) {
      return res.status(404).json({ error: 'المزوّد غير موجود' });
    }

    res.json(vendor);
  } catch (err) {
    console.error('Update vendor error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── DELETE /:id — Delete vendor (organizer only) ───────────
router.delete('/:id', auth, requireRole('organizer'), async (req, res) => {
  try {
    const vendor = await User.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'المزوّد غير موجود' });
    }

    // Remove associated booking document
    await Booking.findOneAndDelete({ vendorId: req.params.id });

    // Log activity
    await ActivityLog.create({
      type: 'vendor',
      message: 'تم حذف المزوّد: ' + vendor.name
    });

    res.json({ message: 'تم حذف المزوّد بنجاح' });
  } catch (err) {
    console.error('Delete vendor error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
