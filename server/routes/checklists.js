const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Checklist = require('../models/Checklist');

// All routes require auth
router.use(auth);

// ─── GET /:planId — Get checklist items for a plan ──────────
router.get('/:planId', async (req, res) => {
  try {
    const items = await Checklist.find({ planId: req.params.planId }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    console.error('Get checklist error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST / — Create checklist item ─────────────────────────
router.post('/', async (req, res) => {
  try {
    const { text, category, planId, order } = req.body;

    if (!text || !planId) {
      return res.status(400).json({ error: 'النص ومعرّف الخطة مطلوبان' });
    }

    const item = await Checklist.create({
      text,
      category: category || '',
      planId,
      order: order || 0,
      done: false
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('Create checklist item error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /:id — Update checklist item ───────────────────────
router.put('/:id', async (req, res) => {
  try {
    const item = await Checklist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ error: 'عنصر القائمة غير موجود' });
    }
    res.json(item);
  } catch (err) {
    console.error('Update checklist item error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── DELETE /:id — Delete checklist item ─────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const item = await Checklist.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'عنصر القائمة غير موجود' });
    }
    res.json({ message: 'تم حذف العنصر بنجاح' });
  } catch (err) {
    console.error('Delete checklist item error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
