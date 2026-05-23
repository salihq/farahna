// ═══════════════════════════════════════════════════════════════
// DATABASE SEEDER — Populates MongoDB with initial data
// Runs automatically on first startup if DB is empty
// ═══════════════════════════════════════════════════════════════

const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
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
  // srv index 0 = تصوير فوتوغرافي
  [
    { name: 'استوديو لقطة الإبداع',   price: 3500, rating: 5, desc: 'تصوير احترافي مع ألبوم فاخر وفريم ذهبي' },
    { name: 'عدسة الذهب',             price: 2800, rating: 4, desc: 'خبرة 10 سنوات في تصوير الأفراح' },
    { name: 'كاميرا الفخامة',          price: 4200, rating: 5, desc: 'تصوير جوي بالدرون + أرضي' },
    { name: 'استوديو النجوم',          price: 2000, rating: 3, desc: 'باقات تصوير اقتصادية مميزة' },
    { name: 'مصور اللحظة',            price: 3000, rating: 4, desc: 'تصوير لحظات عفوية وطبيعية' }
  ],
  // srv index 1 = تصوير فيديو
  [
    { name: 'فيديو آرت',              price: 5000, rating: 5, desc: 'إنتاج سينمائي بجودة 4K' },
    { name: 'سينما الأحلام',           price: 4000, rating: 4, desc: 'مونتاج احترافي مع مؤثرات خاصة' },
    { name: 'عدسة السينما',            price: 3500, rating: 4, desc: 'فيديو كليب زفاف مع طاقم كامل' },
    { name: 'فيلم الذكريات',           price: 2500, rating: 3, desc: 'تصوير وتوثيق الحفل كاملاً' }
  ],
  // srv index 2 = قاعات أفراح (perPerson)
  [
    { name: 'قاعة الألماس الكبرى',     price: 200, rating: 5, desc: 'قاعة فخمة بإطلالة بانورامية', perPerson: true, capacity: 500 },
    { name: 'قصر الأميرات',            price: 150, rating: 4, desc: 'تصميم ملكي كلاسيكي فاخر', perPerson: true, capacity: 400 },
    { name: 'صالة الملكي',             price: 120, rating: 4, desc: 'قاعة عصرية مع حديقة خارجية', perPerson: true, capacity: 350 },
    { name: 'قاعة التألق',             price: 180, rating: 5, desc: 'ثريات كريستال وديكور ذهبي', perPerson: true, capacity: 600 },
    { name: 'قاعة النخبة',             price: 100, rating: 3, desc: 'قاعة أنيقة بأسعار معقولة', perPerson: true, capacity: 250 }
  ],
  // srv index 3 = بوفيه وضيافة (perPerson)
  [
    { name: 'مطبخ الشيف الذهبي',       price: 80, rating: 5, desc: 'أطباق عالمية مع طاهٍ خاص', perPerson: true, capacity: 800 },
    { name: 'بوفيه الفخامة',           price: 60, rating: 4, desc: 'بوفيه مفتوح متنوع', perPerson: true, capacity: 500 },
    { name: 'مطعم النكهات',            price: 45, rating: 3, desc: 'وجبات شرقية وغربية', perPerson: true, capacity: 400 },
    { name: 'ضيافة الملوك',            price: 100, rating: 5, desc: 'قائمة طعام حصرية مع خدمة VIP', perPerson: true, capacity: 300 },
    { name: 'كاترينج السعادة',          price: 55, rating: 4, desc: 'تشكيلة واسعة من المأكولات', perPerson: true, capacity: 600 }
  ],
  // srv index 4 = زفة
  [
    { name: 'فرقة الطرب الأصيل',       price: 4000, rating: 5, desc: 'فرقة شعبية كاملة مع مطرب' },
    { name: 'زفة النجوم',              price: 3000, rating: 4, desc: 'زفة مع دبكة وطبول' },
    { name: 'فرقة الأفراح',            price: 2000, rating: 3, desc: 'زفة تقليدية مميزة' },
    { name: 'زفة الملوك',              price: 5000, rating: 5, desc: 'عرض متكامل مع ألعاب نارية' }
  ],
  // srv index 5 = دي جي وموسيقى
  [
    { name: 'دي جي ماكس',              price: 2500, rating: 4, desc: 'أحدث الأغاني مع إضاءة ليزر' },
    { name: 'صوت الحفلة',              price: 1800, rating: 3, desc: 'دي جي محترف مع معدات صوتية' },
    { name: 'دي جي النجوم',            price: 3500, rating: 5, desc: 'حفلات راقية مع أجواء عالمية' },
    { name: 'ميكس الأفراح',            price: 2000, rating: 4, desc: 'ميكسات حصرية لحفلات الزفاف' }
  ],
  // srv index 6 = إضاءة وصوتيات
  [
    { name: 'إضاءة الحدث',            price: 3000, rating: 4, desc: 'إضاءة LED ملونة مع تحكم ذكي' },
    { name: 'نور الفخامة',             price: 4500, rating: 5, desc: 'ليزر + إضاءة معمارية + ضباب' },
    { name: 'أضواء الليل',             price: 2000, rating: 3, desc: 'إضاءة أساسية مع سبوت لايت' },
    { name: 'تقنيات النور',            price: 3500, rating: 4, desc: 'إضاءة مسرحية احترافية' }
  ],
  // srv index 7 = مكياج وتجميل
  [
    { name: 'صالون الجمال الملكي',      price: 2500, rating: 5, desc: 'مكياج عروس + تسريحة + عناية' },
    { name: 'مكياج الأميرات',           price: 1800, rating: 4, desc: 'لوك طبيعي فاخر' },
    { name: 'بيوتي لاونج',             price: 2000, rating: 4, desc: 'مكياج سينمائي مع عدسات' },
    { name: 'صالون التألق',            price: 1500, rating: 3, desc: 'مكياج وتسريحة كلاسيكية' },
    { name: 'ذا بيوتي هاوس',           price: 3000, rating: 5, desc: 'باقة كاملة: مكياج + شعر + أظافر + سبا' }
  ],
  // srv index 8 = كوشة وديكور
  [
    { name: 'ديكور الأحلام',           price: 5000, rating: 5, desc: 'كوشة ملكية مع أزهار طبيعية' },
    { name: 'كوشة الملكة',             price: 3500, rating: 4, desc: 'تصميم كلاسيكي أنيق' },
    { name: 'تصميم الزهور',            price: 4000, rating: 4, desc: 'تنسيقات زهور هولندية فاخرة' },
    { name: 'ديكور السحر',             price: 2500, rating: 3, desc: 'ديكور عصري بأسعار مناسبة' }
  ],
  // srv index 9 = فساتين زفاف
  [
    { name: 'بوتيك العروس الفاخر',     price: 8000, rating: 5, desc: 'فساتين مصممين عالميين' },
    { name: 'أزياء الفخامة',           price: 5000, rating: 4, desc: 'فساتين مستوردة من إيطاليا' },
    { name: 'دار الموضة',              price: 3500, rating: 3, desc: 'تشكيلة متنوعة من الفساتين' },
    { name: 'بوتيك الأناقة',           price: 6000, rating: 4, desc: 'تصميم حسب الطلب مع تطريز يدوي' }
  ],
  // srv index 10 = دعوات وطباعة
  [
    { name: 'مطبعة الإبداع',           price: 1500, rating: 4, desc: 'كروت دعوة فاخرة مع ختم ذهبي' },
    { name: 'تصاميم الدعوة',           price: 800,  rating: 3, desc: 'دعوات إلكترونية وورقية' },
    { name: 'كارت الفرح',              price: 1200, rating: 4, desc: 'تصميم حصري مع صندوق هدية' },
    { name: 'دعوات VIP',               price: 2000, rating: 5, desc: 'بطاقات أكريليك مع نقش ليزر' }
  ],
  // srv index 11 = حلويات وكيك
  [
    { name: 'حلويات السعادة',          price: 3000, rating: 4, desc: 'كيك زفاف 5 طبقات + حلويات' },
    { name: 'كيك الأحلام',             price: 4000, rating: 5, desc: 'كيك فوندان مصمم حسب الثيم' },
    { name: 'حلويات الفخامة',          price: 2500, rating: 4, desc: 'تشكيلة حلويات شرقية وغربية' },
    { name: 'سويت لاونج',              price: 2000, rating: 3, desc: 'ركن حلويات مع شوكولاتة فاخرة' },
    { name: 'ماستر كيك',               price: 5000, rating: 5, desc: 'كيك فني 7 طبقات مع عرض مباشر' }
  ]
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
  // Only seed if empty
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('📦 Database already seeded — skipping');
    return;
  }

  console.log('🌱 Seeding database...');
  const hashedPassword = await bcrypt.hash('admin', 12);
  const vendorPassword = await bcrypt.hash('123', 12);

  // 1. Create services
  const createdServices = await Service.insertMany(defaultServices);
  console.log(`   ✅ ${createdServices.length} services created`);

  // 2. Create admin organizer
  const admin = await User.create({
    name: 'مدير النظام',
    email: 'admin',
    password: hashedPassword,
    role: 'organizer'
  });
  console.log('   ✅ Admin organizer created (admin/admin)');

  // 3. Create vendors
  let vendorCount = 0;
  for (let srvIdx = 0; srvIdx < vendorsByService.length; srvIdx++) {
    const service = createdServices[srvIdx];
    const vendors = vendorsByService[srvIdx];
    const isPerPerson = srvIdx === 2 || srvIdx === 3; // قاعات and بوفيه

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

      // Create empty booking record
      await Booking.create({ vendorId: vendor._id, dates: [] });
    }
  }
  console.log(`   ✅ ${vendorCount} vendors created`);

  // 4. Create checklist template
  await Checklist.insertMany(
    defaultChecklist.map(item => ({ ...item, planId: 'template', done: false }))
  );
  console.log('   ✅ Checklist template created');

  // 5. Log seed activity
  await ActivityLog.create({
    type: 'system',
    message: 'تم تهيئة قاعدة البيانات بنجاح'
  });

  console.log('🎉 Seeding complete!');
}

module.exports = seedDatabase;
