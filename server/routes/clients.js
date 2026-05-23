const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Client = require('../models/Client');
const ActivityLog = require('../models/ActivityLog');

// All routes require auth + organizer role
router.use(auth, requireRole('organizer'));

// ─── GET / — All clients ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error('Get clients error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /:id — Single client ───────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }
    res.json(client);
  } catch (err) {
    console.error('Get client error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST / — Create client ─────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, phone, expectedGuests, budget, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'اسم العميل مطلوب' });
    }

    const client = await Client.create({
      name,
      phone: phone || '',
      expectedGuests: expectedGuests || 100,
      budget: budget || null,
      status: status || 'active'
    });

    // Log activity
    await ActivityLog.create({
      type: 'client',
      message: 'تم تسجيل عميل جديد: ' + name
    });

    res.status(201).json(client);
  } catch (err) {
    console.error('Create client error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /:id — Update client ───────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }
    res.json(client);
  } catch (err) {
    console.error('Update client error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── DELETE /:id — Delete client ─────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    // Log activity
    await ActivityLog.create({
      type: 'client',
      message: 'تم حذف العميل: ' + client.name
    });

    res.json({ message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    console.error('Delete client error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
