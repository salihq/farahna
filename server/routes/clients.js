const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Client = require('../models/Client');
const Plan = require('../models/Plan');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

router.use(auth, requireRole('organizer'));

router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, expectedGuests, budget, status } = req.body;
    if (!name) return res.status(400).json({ error: 'اسم العميل مطلوب' });
    const client = await Client.create({
      name, phone: phone || '', expectedGuests: expectedGuests || 100,
      budget: budget || null, status: status || 'active'
    });
    await ActivityLog.create({ type: 'client', message: 'تم تسجيل عميل جديد: ' + name });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// DELETE with cascade sync: cancel plans, release vendor dates, notify vendors
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'العميل غير موجود' });

    // Cancel all active plans linked to this client
    const activePlans = await Plan.find({
      clientId: req.params.id,
      status: { $in: ['confirmed', 'pending'] }
    });

    for (const plan of activePlans) {
      if (plan.vendorIds && plan.vendorIds.length > 0) {
        await Booking.updateMany(
          { vendorId: { $in: plan.vendorIds } },
          { $pull: { dates: plan.dateStr } }
        );
        for (const vid of plan.vendorIds) {
          await Notification.create({
            vendorId: vid,
            message: 'تم إلغاء حجز بتاريخ ' + plan.dateStr + ' بسبب حذف العميل: ' + client.name,
            details: { planId: plan._id.toString(), clientName: client.name, date: plan.dateStr },
            read: false
          });
        }
      }
      plan.status = 'cancelled';
      await plan.save();
    }

    await Plan.updateMany(
      { clientId: req.params.id, status: 'draft' },
      { clientName: client.name + ' (محذوف)', clientId: null }
    );

    await ActivityLog.create({
      type: 'client',
      message: 'تم حذف العميل: ' + client.name + (activePlans.length > 0 ? ' (تم إلغاء ' + activePlans.length + ' حجز)' : '')
    });

    res.json({ message: 'تم حذف العميل بنجاح', cancelledPlans: activePlans.length });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
