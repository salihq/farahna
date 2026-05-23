const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Notification = require('../models/Notification');

// All routes require auth
router.use(auth);

// ─── GET / — Get notifications for current vendor ───────────
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ vendorId: req.user._id }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /read-all — Mark all as read ────────────────────────
// Must be defined BEFORE /:id/read to avoid route conflict
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { vendorId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'تم تحديث جميع الإشعارات كمقروءة' });
  } catch (err) {
    console.error('Mark all read error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /:id/read — Mark single notification as read ───────
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }

    // Verify ownership
    if (notification.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
