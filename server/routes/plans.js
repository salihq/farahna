const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Client = require('../models/Client');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// All routes require auth
router.use(auth);

// ─── GET / — All plans (organizer only) ─────────────────────
router.get('/', requireRole('organizer'), async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error('Get plans error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /:id — Single plan ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'الخطة غير موجودة' });
    }
    res.json(plan);
  } catch (err) {
    console.error('Get plan error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /:id/export — Export plan as HTML ───────────────────
router.get('/:id/export', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'الخطة غير موجودة' });
    }

    // Fetch client info
    let clientInfo = null;
    if (plan.clientId) {
      clientInfo = await Client.findById(plan.clientId);
    }

    // Fetch vendor details
    const vendors = await User.find({ _id: { $in: plan.vendorIds || [] } }).select('-password');

    // Calculate total cost
    const totalCost = vendors.reduce((sum, v) => {
      if (v.pricingType === 'perPerson' && plan.guests) {
        return sum + (v.price * plan.guests);
      }
      return sum + (v.price || 0);
    }, 0);

    // Build contacts HTML
    const contactsHtml = (plan.bookedBy && plan.bookedBy.contacts && plan.bookedBy.contacts.length > 0)
      ? plan.bookedBy.contacts.map(c =>
          `<div class="info-row" style="margin-right:20px;">
            <span class="label">${c.role || 'جهة اتصال'}:</span> ${c.name || '—'} — ${c.phone || '—'}
          </div>`
        ).join('')
      : '';

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تصدير خطة الزفاف</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; background: #fff; }
    h1 { color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 10px; }
    h2 { color: #2c3e50; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
    th { background: #f8f9fa; }
    .total { font-size: 1.3em; font-weight: bold; color: #27ae60; margin-top: 20px; }
    .info-row { margin: 5px 0; }
    .label { font-weight: bold; color: #555; }
  </style>
</head>
<body>
  <h1>🎊 خطة الزفاف</h1>
  
  <h2>معلومات العميل</h2>
  ${clientInfo ? `
    <div class="info-row"><span class="label">الاسم:</span> ${clientInfo.name}</div>
    <div class="info-row"><span class="label">الهاتف:</span> ${clientInfo.phone || '—'}</div>
    <div class="info-row"><span class="label">البريد:</span> ${clientInfo.email || '—'}</div>
  ` : '<p>لا توجد بيانات عميل</p>'}

  <h2>تفاصيل المناسبة</h2>
  <div class="info-row"><span class="label">نوع المناسبة:</span> ${plan.eventType || '—'}</div>
  <div class="info-row"><span class="label">التاريخ:</span> ${plan.dateStr || '—'}</div>
  <div class="info-row"><span class="label">الوقت:</span> ${plan.eventTime || '—'}</div>
  <div class="info-row"><span class="label">المكان:</span> ${plan.venue || '—'}</div>
  <div class="info-row"><span class="label">عدد الضيوف:</span> ${plan.guests || '—'}</div>

  ${plan.bookedBy && plan.bookedBy.name ? `
  <h2>معلومات الحجز</h2>
  <div class="info-row"><span class="label">الحاجز:</span> ${plan.bookedBy.name}</div>
  <div class="info-row"><span class="label">المصدر:</span> ${plan.bookedBy.source || '—'}</div>
  ${contactsHtml}
  ${plan.bookedBy.notes ? `<div class="info-row"><span class="label">ملاحظات:</span> ${plan.bookedBy.notes}</div>` : ''}
  ` : ''}

  ${plan.specialRequests ? `
  <h2>طلبات خاصة</h2>
  <p>${plan.specialRequests}</p>
  ` : ''}

  <h2>المزوّدون</h2>
  <table>
    <thead>
      <tr>
        <th>الاسم</th>
        <th>الخدمة</th>
        <th>السعر</th>
        <th>نوع التسعير</th>
        <th>التكلفة</th>
      </tr>
    </thead>
    <tbody>
      ${vendors.map(v => {
        const cost = v.pricingType === 'perPerson' && plan.guests
          ? v.price * plan.guests
          : v.price || 0;
        return `<tr>
          <td>${v.name}</td>
          <td>${v.serviceId || '—'}</td>
          <td>${v.price || 0}</td>
          <td>${v.pricingType === 'perPerson' ? 'لكل شخص' : 'سعر ثابت'}</td>
          <td>${cost}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="total">الإجمالي: ${totalCost} ر.س</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Export plan error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST /reserve — Create a reservation plan (organizer) ──
router.post('/reserve', requireRole('organizer'), async (req, res) => {
  try {
    const {
      clientId, dateStr, vendorIds, guests, organizerName, name, status,
      eventType, eventTime, venue, specialRequests
    } = req.body;

    if (!dateStr || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ error: 'التاريخ والمزوّدون مطلوبون' });
    }

    const planStatus = status || 'confirmed';

    // Check availability for all vendors before proceeding
    if (planStatus === 'confirmed') {
      const conflicts = [];
      for (const vid of vendorIds) {
        const booking = await Booking.findOne({ vendorId: vid });
        if (booking && booking.dates.includes(dateStr)) {
          const vendor = await User.findById(vid);
          conflicts.push(vendor ? vendor.name : vid);
        }
      }
      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'بعض المزودين محجوزون في هذا التاريخ: ' + conflicts.join('، '),
          conflicts
        });
      }
    }

    // Fetch vendors to calculate total cost
    const vendors = await User.find({ _id: { $in: vendorIds } }).select('-password');

    const totalCost = vendors.reduce((sum, v) => {
      // Find if there's a special price for this date
      const special = v.specialPricing && v.specialPricing.find(sp => sp.dateStr === dateStr);
      const effectivePrice = special ? special.price : (v.price || 0);

      if (v.pricingType === 'perPerson' && guests) {
        return sum + (effectivePrice * guests);
      }
      return sum + effectivePrice;
    }, 0);

    // Get client name if linked
    let clientName = 'عميل غير مسجل';
    if (clientId) {
      const client = await Client.findById(clientId);
      if (client) clientName = client.name;
    }

    // Create the plan
    const plan = await Plan.create({
      clientId: clientId || null,
      clientName,
      name: name || 'خطة مقترحة',
      dateStr,
      vendorIds,
      guests: guests || 0,
      totalCost,
      status: planStatus,
      bookedBy: req.body.bookedBy || {
        name: '',
        contacts: [],
        source: 'website',
        notes: ''
      },
      eventType: eventType || 'زفاف',
      eventTime: eventTime || 'مسائي',
      venue: venue || '',
      specialRequests: specialRequests || ''
    });

    // If confirmed, notify vendors and update client
    if (planStatus === 'confirmed') {
      if (clientId) {
        await Client.findByIdAndUpdate(clientId, { status: 'booked' });
      }

      for (const vendor of vendors) {
        await Booking.findOneAndUpdate(
          { vendorId: vendor._id },
          { $addToSet: { dates: dateStr } },
          { upsert: true }
        );

        await Notification.create({
          vendorId: vendor._id,
          message: `لديك حجز جديد بتاريخ ${dateStr}`,
          details: {
            planId: plan._id.toString(),
            clientName,
            organizerName: organizerName || req.user.name,
            date: dateStr,
            guests,
            eventType: plan.eventType,
            venue: plan.venue,
            eventTime: plan.eventTime
          },
          read: false
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      type: 'plan',
      message: (planStatus === 'draft' ? 'تم حفظ خطة مبدئية بتاريخ ' : 'تم إنشاء حجز مؤكد بتاريخ ') + dateStr + ' لـ ' + clientName
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error('Reserve plan error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── PUT /:id — Update plan (organizer) ─────────────────────
router.put('/:id', requireRole('organizer'), async (req, res) => {
  try {
    const oldPlan = await Plan.findById(req.params.id);
    if (!oldPlan) {
      return res.status(404).json({ error: 'الخطة غير موجودة' });
    }

    const wasDraft = oldPlan.status === 'draft';
    const wasConfirmed = oldPlan.status === 'confirmed';
    const isNowConfirmed = req.body.status === 'confirmed';
    const isNowCancelled = req.body.status === 'cancelled';

    // Preserve the old dateStr before overwriting for cancellation logic
    const oldDateStr = oldPlan.dateStr;
    const oldVendorIds = [...oldPlan.vendorIds];

    Object.assign(oldPlan, req.body);
    const plan = await oldPlan.save();

    if (wasDraft && isNowConfirmed) {
      // Conflict check before confirming
      const conflicts = [];
      for (const vid of plan.vendorIds) {
        const booking = await Booking.findOne({ vendorId: vid });
        if (booking && booking.dates.includes(plan.dateStr)) {
          const vendor = await User.findById(vid);
          conflicts.push(vendor ? vendor.name : vid);
        }
      }
      if (conflicts.length > 0) {
        // Revert status back to draft
        plan.status = 'draft';
        await plan.save();
        return res.status(409).json({
          error: 'بعض المزودين محجوزون في هذا التاريخ: ' + conflicts.join('، '),
          conflicts
        });
      }

      if (plan.clientId) {
        await Client.findByIdAndUpdate(plan.clientId, { status: 'booked' });
      }

      const vendors = await User.find({ _id: { $in: plan.vendorIds } }).select('-password');
      for (const vendor of vendors) {
        await Booking.findOneAndUpdate(
          { vendorId: vendor._id },
          { $addToSet: { dates: plan.dateStr } },
          { upsert: true }
        );

        await Notification.create({
          vendorId: vendor._id,
          message: `لديك حجز مؤكد بتاريخ ${plan.dateStr}`,
          details: {
            planId: plan._id.toString(),
            clientName: plan.clientName,
            organizerName: req.user.name,
            date: plan.dateStr,
            guests: plan.guests,
            eventType: plan.eventType,
            venue: plan.venue,
            eventTime: plan.eventTime
          },
          read: false
        });
      }
      
      await ActivityLog.create({
        type: 'plan',
        message: 'تم تأكيد الحجز بتاريخ ' + plan.dateStr + ' لـ ' + plan.clientName
      });
    } else if (isNowCancelled && !wasDraft) {
      // Cancellation — remove dates from all vendors
      await Booking.updateMany(
        { vendorId: { $in: oldVendorIds } },
        { $pull: { dates: oldDateStr } }
      );

      const vendors = await User.find({ _id: { $in: oldVendorIds } }).select('-password');
      for (const vendor of vendors) {
        await Notification.create({
          vendorId: vendor._id,
          message: `تم إلغاء الحجز لتاريخ ${oldDateStr}`,
          details: {
            planId: plan._id.toString(),
            clientName: plan.clientName,
            organizerName: req.user.name,
            date: oldDateStr,
            guests: plan.guests
          },
          read: false
        });
      }
      
      await ActivityLog.create({
        type: 'plan',
        message: 'تم إلغاء الحجز بتاريخ ' + oldDateStr + ' لـ ' + plan.clientName
      });
    }

    res.json(plan);
  } catch (err) {
    console.error('Update plan error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
