// ═══════════════════════════════════════════════════════════════
// DATABASE SEEDER — Populates MongoDB with rich test data
// Runs automatically on first startup if DB is empty
// ═══════════════════════════════════════════════════════════════

const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Client = require('./models/Client');
const Plan = require('./models/Plan');
const Notification = require('./models/Notification');
const Checklist = require('./models/Checklist');
const ActivityLog = require('./models/ActivityLog');

// ─── Default Service Categories ─────────────────────────────

const defaultServices = [
  { name: 'تصوير فوتوغرافي', icon: 'fa-camera',              color: '#e74c3c' },
  { name: 'تصوير فيديو',     icon: 'fa-video',               color: '#9b59b6' },
  { name: 'قاعات أفراح',      icon: 'fa-building-columns',    color: '#3498db' },
  { name: 'بوفيه وضيافة',     icon: 'fa-utensils',            color: '#e67e22' },
  { name: 'زفة',              icon: 'fa-drum',                color: '#1abc9c' },
  { name: 'دي جي وموسيقى',   icon: 'fa-music',               color: '#f39c12' },
  { name: 'إضاءة وصوتيات',   icon: 'fa-lightbulb',           color: '#2ecc71' },
  { name: 'مكياج وتجميل',     icon: 'fa-paintbrush',          color: '#e91e63' },
  { name: 'كوشة وديكور',      icon: 'fa-wand-magic-sparkles', color: '#8e44ad' },
  { name: 'فساتين زفاف',      icon: 'fa-shirt',              color: '#ff6b6b' },
  { name: 'دعوات وطباعة',     icon: 'fa-envelope',            color: '#00b894' },
  { name: 'حلويات وكيك',      icon: 'fa-cake-candles',        color: '#fd79a8' }
];

// ─── Mock Vendor Data ───────────────────────────────────────

const vendorsByService = [
  // srv 0 = تصوير فوتوغرافي
  [
    { name: 'استوديو لقطة الإبداع',   price: 3500, rating: 5, desc: 'تصوير احترافي مع ألبوم فاخر وفريم ذهبي' },
    { name: 'عدسة الذهب',             price: 2800, rating: 4, desc: 'خبرة 10 سنوات في تصوير الأفراح' },
    { name: 'كاميرا الفخامة',          price: 4200, rating: 5, desc: 'تصوير جوي بالدرون + أرضي' },
    { name: 'استوديو النجوم',          price: 2000, rating: 3, desc: 'باقات تصوير اقتصادية مميزة' },
    { name: 'مصور اللحظة',            price: 3000, rating: 4, desc: 'تصوير لحظات عفوية وطبيعية' }
  ],
  // srv 1 = تصوير فيديو
  [
    { name: 'فيديو آرت',              price: 5000, rating: 5, desc: 'إنتاج سينمائي بجودة 4K' },
    { name: 'سينما الأحلام',           price: 4000, rating: 4, desc: 'مونتاج احترافي مع مؤثرات خاصة' },
    { name: 'عدسة السينما',            price: 3500, rating: 4, desc: 'فيديو كليب زفاف مع طاقم كامل' },
    { name: 'فيلم الذكريات',           price: 2500, rating: 3, desc: 'تصوير وتوثيق الحفل كاملاً' }
  ],
  // srv 2 = قاعات أفراح (perPerson)
  [
    { name: 'قاعة الألماس الكبرى',     price: 200, rating: 5, desc: 'قاعة فخمة بإطلالة بانورامية', perPerson: true, capacity: 500 },
    { name: 'قصر الأميرات',            price: 150, rating: 4, desc: 'تصميم ملكي كلاسيكي فاخر', perPerson: true, capacity: 400 },
    { name: 'صالة الملكي',             price: 120, rating: 4, desc: 'قاعة عصرية مع حديقة خارجية', perPerson: true, capacity: 350 },
    { name: 'قاعة التألق',             price: 180, rating: 5, desc: 'ثريات كريستال وديكور ذهبي', perPerson: true, capacity: 600 },
    { name: 'قاعة النخبة',             price: 100, rating: 3, desc: 'قاعة أنيقة بأسعار معقولة', perPerson: true, capacity: 250 }
  ],
  // srv 3 = بوفيه وضيافة (perPerson)
  [
    { name: 'مطبخ الشيف الذهبي',       price: 80, rating: 5, desc: 'أطباق عالمية مع طاهٍ خاص', perPerson: true, capacity: 800 },
    { name: 'بوفيه الفخامة',           price: 60, rating: 4, desc: 'بوفيه مفتوح متنوع', perPerson: true, capacity: 500 },
    { name: 'مطعم النكهات',            price: 45, rating: 3, desc: 'وجبات شرقية وغربية', perPerson: true, capacity: 400 },
    { name: 'ضيافة الملوك',            price: 100, rating: 5, desc: 'قائمة طعام حصرية مع خدمة VIP', perPerson: true, capacity: 300 },
    { name: 'كاترينج السعادة',          price: 55, rating: 4, desc: 'تشكيلة واسعة من المأكولات', perPerson: true, capacity: 600 }
  ],
  // srv 4 = زفة
  [
    { name: 'فرقة الطرب الأصيل',       price: 4000, rating: 5, desc: 'فرقة شعبية كاملة مع مطرب' },
    { name: 'زفة النجوم',              price: 3000, rating: 4, desc: 'زفة مع دبكة وطبول' },
    { name: 'فرقة الأفراح',            price: 2000, rating: 3, desc: 'زفة تقليدية مميزة' },
    { name: 'زفة الملوك',              price: 5000, rating: 5, desc: 'عرض متكامل مع ألعاب نارية' }
  ],
  // srv 5 = دي جي وموسيقى
  [
    { name: 'دي جي ماكس',              price: 2500, rating: 4, desc: 'أحدث الأغاني مع إضاءة ليزر' },
    { name: 'صوت الحفلة',              price: 1800, rating: 3, desc: 'دي جي محترف مع معدات صوتية' },
    { name: 'دي جي النجوم',            price: 3500, rating: 5, desc: 'حفلات راقية مع أجواء عالمية' },
    { name: 'ميكس الأفراح',            price: 2000, rating: 4, desc: 'ميكسات حصرية لحفلات الزفاف' }
  ],
  // srv 6 = إضاءة وصوتيات
  [
    { name: 'إضاءة الحدث',            price: 3000, rating: 4, desc: 'إضاءة LED ملونة مع تحكم ذكي' },
    { name: 'نور الفخامة',             price: 4500, rating: 5, desc: 'ليزر + إضاءة معمارية + ضباب' },
    { name: 'أضواء الليل',             price: 2000, rating: 3, desc: 'إضاءة أساسية مع سبوت لايت' },
    { name: 'تقنيات النور',            price: 3500, rating: 4, desc: 'إضاءة مسرحية احترافية' }
  ],
  // srv 7 = مكياج وتجميل
  [
    { name: 'صالون الجمال الملكي',      price: 2500, rating: 5, desc: 'مكياج عروس + تسريحة + عناية' },
    { name: 'مكياج الأميرات',           price: 1800, rating: 4, desc: 'لوك طبيعي فاخر' },
    { name: 'بيوتي لاونج',             price: 2000, rating: 4, desc: 'مكياج سينمائي مع عدسات' },
    { name: 'صالون التألق',            price: 1500, rating: 3, desc: 'مكياج وتسريحة كلاسيكية' },
    { name: 'ذا بيوتي هاوس',           price: 3000, rating: 5, desc: 'باقة كاملة: مكياج + شعر + أظافر + سبا' }
  ],
  // srv 8 = كوشة وديكور
  [
    { name: 'ديكور الأحلام',           price: 5000, rating: 5, desc: 'كوشة ملكية مع أزهار طبيعية' },
    { name: 'كوشة الملكة',             price: 3500, rating: 4, desc: 'تصميم كلاسيكي أنيق' },
    { name: 'تصميم الزهور',            price: 4000, rating: 4, desc: 'تنسيقات زهور هولندية فاخرة' },
    { name: 'ديكور السحر',             price: 2500, rating: 3, desc: 'ديكور عصري بأسعار مناسبة' }
  ],
  // srv 9 = فساتين زفاف
  [
    { name: 'بوتيك العروس الفاخر',     price: 8000, rating: 5, desc: 'فساتين مصممين عالميين' },
    { name: 'أزياء الفخامة',           price: 5000, rating: 4, desc: 'فساتين مستوردة من إيطاليا' },
    { name: 'دار الموضة',              price: 3500, rating: 3, desc: 'تشكيلة متنوعة من الفساتين' },
    { name: 'بوتيك الأناقة',           price: 6000, rating: 4, desc: 'تصميم حسب الطلب مع تطريز يدوي' }
  ],
  // srv 10 = دعوات وطباعة
  [
    { name: 'مطبعة الإبداع',           price: 1500, rating: 4, desc: 'كروت دعوة فاخرة مع ختم ذهبي' },
    { name: 'تصاميم الدعوة',           price: 800,  rating: 3, desc: 'دعوات إلكترونية وورقية' },
    { name: 'كارت الفرح',              price: 1200, rating: 4, desc: 'تصميم حصري مع صندوق هدية' },
    { name: 'دعوات VIP',               price: 2000, rating: 5, desc: 'بطاقات أكريليك مع نقش ليزر' }
  ],
  // srv 11 = حلويات وكيك
  [
    { name: 'حلويات السعادة',          price: 3000, rating: 4, desc: 'كيك زفاف 5 طبقات + حلويات' },
    { name: 'كيك الأحلام',             price: 4000, rating: 5, desc: 'كيك فوندان مصمم حسب الثيم' },
    { name: 'حلويات الفخامة',          price: 2500, rating: 4, desc: 'تشكيلة حلويات شرقية وغربية' },
    { name: 'سويت لاونج',              price: 2000, rating: 3, desc: 'ركن حلويات مع شوكولاتة فاخرة' },
    { name: 'ماستر كيك',               price: 5000, rating: 5, desc: 'كيك فني 7 طبقات مع عرض مباشر' }
  ]
];

// ─── Clients Data ───────────────────────────────────────────

const clientsData = [
  { name: 'أحمد ومريم الشمري', phone: '0501234567', expectedGuests: 300, budget: 80000, status: 'booked' },
  { name: 'خالد وسارة العتيبي', phone: '0559876543', expectedGuests: 200, budget: 50000, status: 'booked' },
  { name: 'عبدالله ونورة القحطاني', phone: '0541112233', expectedGuests: 450, budget: 120000, status: 'booked' },
  { name: 'محمد وفاطمة الحربي', phone: '0534445566', expectedGuests: 150, budget: 35000, status: 'active' },
  { name: 'ياسر وهدى الزهراني', phone: '0527778899', expectedGuests: 250, budget: 65000, status: 'active' },
  { name: 'فهد ولمياء الغامدي', phone: '0563334455', expectedGuests: 180, budget: 45000, status: 'active' },
  { name: 'سلطان ودانة المطيري', phone: '0582223344', expectedGuests: 350, budget: 90000, status: 'completed' },
  { name: 'عمر وريم الدوسري', phone: '0576667788', expectedGuests: 120, budget: 30000, status: 'active' },
  { name: 'بندر وأسماء السبيعي', phone: '0548889900', expectedGuests: 400, budget: 100000, status: 'active' },
  { name: 'ناصر وعبير الشهري', phone: '0591234560', expectedGuests: 280, budget: 70000, status: 'active' },
  { name: 'تركي ومها الرشيدي', phone: '0567890123', expectedGuests: 220, budget: 55000, status: 'active' },
  { name: 'سعد وليلى البلوي', phone: '0539012345', expectedGuests: 160, budget: 40000, status: 'active' }
];

// ─── Default Checklist Template ─────────────────────────────

const defaultChecklist = [
  { text: 'حجز القاعة',                category: '6months', order: 1 },
  { text: 'اختيار المصور والمصور الفيديو', category: '6months', order: 2 },
  { text: 'حجز الكاترينج',              category: '6months', order: 3 },
  { text: 'اختيار الفستان',              category: '3months', order: 4 },
  { text: 'طباعة الدعوات',               category: '3months', order: 5 },
  { text: 'حجز الزفة والدي جي',          category: '3months', order: 6 },
  { text: 'تجربة المكياج',               category: '1month',  order: 7 },
  { text: 'تأكيد جميع الحجوزات',          category: '1month',  order: 8 },
  { text: 'ترتيب الديكور والكوشة',        category: '1month',  order: 9 },
  { text: 'توزيع الدعوات',               category: '1month',  order: 10 },
  { text: 'تأكيد عدد الحضور النهائي',     category: '1week',   order: 11 },
  { text: 'تجهيز حقيبة العروس',          category: '1week',   order: 12 },
  { text: 'بروفة يوم الزفاف',            category: '1week',   order: 13 },
  { text: 'تسليم القاعة للمنسق',          category: 'dayof',   order: 14 },
  { text: 'التأكد من وصول جميع المزودين',  category: 'dayof',   order: 15 }
];

// ═══════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('📦 Database already seeded — skipping');
    return;
  }

  console.log('🌱 Seeding database with rich test data...');
  const hashedPassword = await bcrypt.hash('admin', 12);
  const vendorPassword = await bcrypt.hash('123', 12);

  // 1. Create services
  const createdServices = await Service.insertMany(defaultServices);
  console.log(`   ✅ ${createdServices.length} services created`);

  // 2. Create admin organizer
  await User.create({
    name: 'مدير النظام',
    email: 'admin',
    password: hashedPassword,
    role: 'organizer'
  });
  console.log('   ✅ Admin organizer created (admin/admin)');

  // 3. Create vendors
  const allVendors = [];
  let vendorCount = 0;
  for (let srvIdx = 0; srvIdx < vendorsByService.length; srvIdx++) {
    const service = createdServices[srvIdx];
    const vendors = vendorsByService[srvIdx];
    const isPerPerson = srvIdx === 2 || srvIdx === 3;

    for (const v of vendors) {
      vendorCount++;
      const vendor = await User.create({
        name: v.name,
        email: `v${vendorCount}@wedding.com`,
        password: vendorPassword,
        role: 'vendor',
        phone: '05' + String(Math.floor(10000000 + Math.random() * 90000000)),
        serviceId: service._id.toString(),
        price: v.price,
        pricingType: isPerPerson || v.perPerson ? 'perPerson' : 'flat',
        maxCapacity: v.capacity || null,
        rating: v.rating,
        description: v.desc
      });
      allVendors.push({ vendor, srvIdx });
      await Booking.create({ vendorId: vendor._id, dates: [] });
    }
  }
  console.log(`   ✅ ${vendorCount} vendors created`);

  // 4. Create clients
  const createdClients = [];
  for (const c of clientsData) {
    const client = await Client.create(c);
    createdClients.push(client);
  }
  console.log(`   ✅ ${createdClients.length} clients created`);

  // 5. Create plans and bookings
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Helper to format date
  const fmtDate = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Plan configs: [clientIndex, dayOffset, guestCount, status, eventType, vendorIndices]
  const planConfigs = [
    // Confirmed plans (past and future)
    { ci: 0, date: fmtDate(year, month, 15), guests: 300, status: 'confirmed', eventType: 'زفاف', eventTime: 'مسائي', venue: 'قاعة الألماس الكبرى', vIndices: [0, 5, 10, 20, 30, 35] },
    { ci: 1, date: fmtDate(year, month+1, 10), guests: 200, status: 'confirmed', eventType: 'زفاف', eventTime: 'مسائي', venue: 'قصر الأميرات', vIndices: [1, 6, 11, 21, 36] },
    { ci: 2, date: fmtDate(year, month+1, 25), guests: 450, status: 'confirmed', eventType: 'زفاف', eventTime: 'مسائي', venue: 'قاعة التألق', vIndices: [2, 7, 13, 22, 25, 31, 40] },
    { ci: 6, date: fmtDate(year, month-1, 20), guests: 350, status: 'completed', eventType: 'زفاف', eventTime: 'مسائي', venue: 'صالة الملكي', vIndices: [3, 8, 14, 23, 27, 37] },
    // Engagement
    { ci: 3, date: fmtDate(year, month+2, 5), guests: 150, status: 'confirmed', eventType: 'خطوبة', eventTime: 'مسائي', venue: 'قاعة النخبة', vIndices: [4, 9, 15, 38] },
    // Draft plans
    { ci: 4, date: fmtDate(year, month+2, 15), guests: 250, status: 'draft', eventType: 'زفاف', eventTime: 'مسائي', venue: '', vIndices: [0, 10, 20, 30, 40] },
    { ci: 5, date: fmtDate(year, month+3, 1), guests: 180, status: 'draft', eventType: 'عقد قران', eventTime: 'صباحي', venue: '', vIndices: [1, 11, 21] },
    // More confirmed
    { ci: 7, date: fmtDate(year, month+1, 5), guests: 120, status: 'confirmed', eventType: 'عقد قران', eventTime: 'صباحي', venue: 'قاعة النخبة', vIndices: [3, 26, 34] },
    { ci: 8, date: fmtDate(year, month+2, 20), guests: 400, status: 'confirmed', eventType: 'زفاف', eventTime: 'مسائي', venue: 'قاعة الألماس الكبرى', vIndices: [2, 5, 12, 22, 28, 32, 41] },
    // Cancelled
    { ci: 9, date: fmtDate(year, month, 28), guests: 280, status: 'cancelled', eventType: 'زفاف', eventTime: 'مسائي', venue: 'قصر الأميرات', vIndices: [0, 6, 14] },
  ];

  let planCount = 0;
  for (const pc of planConfigs) {
    const client = createdClients[pc.ci];
    if (!client) continue;

    // Get vendor IDs (safely, within array bounds)
    const vendorIds = [];
    let totalCost = 0;
    for (const vi of pc.vIndices) {
      if (vi < allVendors.length) {
        const v = allVendors[vi].vendor;
        vendorIds.push(v._id);
        if (v.pricingType === 'perPerson') {
          totalCost += v.price * pc.guests;
        } else {
          totalCost += v.price;
        }
      }
    }

    const plan = await Plan.create({
      clientId: client._id,
      clientName: client.name,
      name: pc.eventType + ' ' + client.name.split(' ')[0],
      dateStr: pc.date,
      vendorIds,
      guests: pc.guests,
      totalCost,
      status: pc.status,
      eventType: pc.eventType,
      eventTime: pc.eventTime,
      venue: pc.venue,
      specialRequests: pc.status === 'confirmed' ? 'يرجى تجهيز كل شيء قبل الموعد بساعتين' : '',
      bookedBy: {
        name: client.name.split(' ')[0],
        contacts: [
          { name: client.name.split(' ')[0], phone: client.phone, role: 'العريس' },
          { name: client.name.split('و')[1]?.trim()?.split(' ')[0] || 'العروس', phone: '05' + String(Math.floor(10000000 + Math.random() * 90000000)), role: 'العروس' }
        ],
        source: ['website', 'organizer', 'external'][Math.floor(Math.random() * 3)],
        notes: ''
      }
    });
    planCount++;

    // Book dates for confirmed plans
    if (pc.status === 'confirmed' || pc.status === 'completed') {
      for (const vid of vendorIds) {
        await Booking.findOneAndUpdate(
          { vendorId: vid },
          { $addToSet: { dates: pc.date } },
          { upsert: true }
        );
        await Notification.create({
          vendorId: vid,
          message: 'لديك حجز جديد بتاريخ ' + pc.date,
          details: { planId: plan._id.toString(), clientName: client.name, date: pc.date, guests: pc.guests },
          read: pc.status === 'completed'
        });
      }
    }
  }
  console.log(`   ✅ ${planCount} plans created (with bookings & notifications)`);

  // 6. Add some manual blocks from vendors
  const manualDates = [
    fmtDate(year, month, 20), fmtDate(year, month, 21),
    fmtDate(year, month+1, 1), fmtDate(year, month+1, 15)
  ];
  for (let i = 0; i < Math.min(8, allVendors.length); i++) {
    const dates = [manualDates[i % manualDates.length]];
    await Booking.findOneAndUpdate(
      { vendorId: allVendors[i].vendor._id },
      { $addToSet: { dates: { $each: dates } } }
    );
  }
  console.log('   ✅ Manual vendor blocks added');

  // 7. Create checklist template
  await Checklist.insertMany(
    defaultChecklist.map(item => ({ ...item, planId: 'template', done: false }))
  );
  console.log('   ✅ Checklist template created');

  // 8. Activity log
  await ActivityLog.insertMany([
    { type: 'system', message: 'تم تهيئة قاعدة البيانات بنجاح' },
    { type: 'plan', message: 'تم إنشاء حجز زفاف أحمد ومريم الشمري' },
    { type: 'plan', message: 'تم إنشاء حجز زفاف خالد وسارة العتيبي' },
    { type: 'client', message: 'تم تسجيل 12 عميل جديد' },
    { type: 'vendor', message: 'تم تسجيل ' + vendorCount + ' مزود خدمة' }
  ]);

  console.log('🎉 Seeding complete! Rich test data ready.');
}

module.exports = seedDatabase;
