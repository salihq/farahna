// ═══════════════════════════════════════════════════════════════
// LAYER 1: DATA LAYER — IndexedDB Schema, Seeding & CRUD
// Pure data access only. No business logic here.
// ═══════════════════════════════════════════════════════════════

window.db = {};

const DB_NAME = 'WeddingPlannerDB_v5';
const DB_VERSION = 1;
let idbInstance = null;

// ─── Default Service Categories ─────────────────────────────

const defaultServices = [
  { id: 'srv_1',  name: 'تصوير فوتوغرافي', icon: 'fa-camera',              color: '#e74c3c' },
  { id: 'srv_2',  name: 'تصوير فيديو',     icon: 'fa-video',               color: '#9b59b6' },
  { id: 'srv_3',  name: 'قاعات أفراح',      icon: 'fa-building-columns',    color: '#3498db' },
  { id: 'srv_4',  name: 'بوفيه وضيافة',     icon: 'fa-utensils',            color: '#e67e22' },
  { id: 'srv_5',  name: 'زفة',              icon: 'fa-drum',                color: '#1abc9c' },
  { id: 'srv_6',  name: 'دي جي وموسيقى',   icon: 'fa-music',               color: '#f39c12' },
  { id: 'srv_7',  name: 'إضاءة وصوتيات',   icon: 'fa-lightbulb',           color: '#2ecc71' },
  { id: 'srv_8',  name: 'مكياج وتجميل',     icon: 'fa-paintbrush',          color: '#e91e63' },
  { id: 'srv_9',  name: 'كوشة وديكور',      icon: 'fa-wand-magic-sparkles', color: '#8e44ad' },
  { id: 'srv_10', name: 'فساتين زفاف',      icon: 'fa-shirt',              color: '#ff6b6b' },
  { id: 'srv_11', name: 'دعوات وطباعة',     icon: 'fa-envelope',            color: '#00b894' },
  { id: 'srv_12', name: 'حلويات وكيك',      icon: 'fa-cake-candles',        color: '#fd79a8' }
];

// ─── Generate Mock Vendors ──────────────────────────────────

function generateMockVendors() {
  const vendors = [];
  const vendorData = {
    srv_1: [
      { name: 'استوديو لقطة الإبداع',   price: 3500, rating: 5, desc: 'تصوير احترافي مع ألبوم فاخر وفريم ذهبي' },
      { name: 'عدسة الذهب',             price: 2800, rating: 4, desc: 'خبرة 10 سنوات في تصوير الأفراح' },
      { name: 'كاميرا الفخامة',          price: 4200, rating: 5, desc: 'تصوير جوي بالدرون + أرضي' },
      { name: 'استوديو النجوم',          price: 2000, rating: 3, desc: 'باقات تصوير اقتصادية مميزة' },
      { name: 'مصور اللحظة',            price: 3000, rating: 4, desc: 'تصوير لحظات عفوية وطبيعية' }
    ],
    srv_2: [
      { name: 'فيديو آرت',              price: 5000, rating: 5, desc: 'إنتاج سينمائي بجودة 4K' },
      { name: 'سينما الأحلام',           price: 4000, rating: 4, desc: 'مونتاج احترافي مع مؤثرات خاصة' },
      { name: 'عدسة السينما',            price: 3500, rating: 4, desc: 'فيديو كليب زفاف مع طاقم كامل' },
      { name: 'فيلم الذكريات',           price: 2500, rating: 3, desc: 'تصوير وتوثيق الحفل كاملاً' }
    ],
    srv_3: [
      { name: 'قاعة الألماس الكبرى',     price: 200, rating: 5, desc: 'قاعة فخمة بإطلالة بانورامية', perPerson: true, capacity: 500 },
      { name: 'قصر الأميرات',            price: 150, rating: 4, desc: 'تصميم ملكي كلاسيكي فاخر', perPerson: true, capacity: 400 },
      { name: 'صالة الملكي',             price: 120, rating: 4, desc: 'قاعة عصرية مع حديقة خارجية', perPerson: true, capacity: 350 },
      { name: 'قاعة التألق',             price: 180, rating: 5, desc: 'ثريات كريستال وديكور ذهبي', perPerson: true, capacity: 600 },
      { name: 'قاعة النخبة',             price: 100, rating: 3, desc: 'قاعة أنيقة بأسعار معقولة', perPerson: true, capacity: 250 }
    ],
    srv_4: [
      { name: 'مطبخ الشيف الذهبي',       price: 80, rating: 5, desc: 'أطباق عالمية مع طاهٍ خاص', perPerson: true, capacity: 800 },
      { name: 'بوفيه الفخامة',           price: 60, rating: 4, desc: 'بوفيه مفتوح متنوع', perPerson: true, capacity: 500 },
      { name: 'مطعم النكهات',            price: 45, rating: 3, desc: 'وجبات شرقية وغربية', perPerson: true, capacity: 400 },
      { name: 'ضيافة الملوك',            price: 100, rating: 5, desc: 'قائمة طعام حصرية مع خدمة VIP', perPerson: true, capacity: 300 },
      { name: 'كاترينج السعادة',          price: 55, rating: 4, desc: 'تشكيلة واسعة من المأكولات', perPerson: true, capacity: 600 }
    ],
    srv_5: [
      { name: 'فرقة الطرب الأصيل',       price: 4000, rating: 5, desc: 'فرقة شعبية كاملة مع مطرب' },
      { name: 'زفة النجوم',              price: 3000, rating: 4, desc: 'زفة مع دبكة وطبول' },
      { name: 'فرقة الأفراح',            price: 2000, rating: 3, desc: 'زفة تقليدية مميزة' },
      { name: 'زفة الملوك',              price: 5000, rating: 5, desc: 'عرض متكامل مع ألعاب نارية' }
    ],
    srv_6: [
      { name: 'دي جي ماكس',              price: 2500, rating: 4, desc: 'أحدث الأغاني مع إضاءة ليزر' },
      { name: 'صوت الحفلة',              price: 1800, rating: 3, desc: 'دي جي محترف مع معدات صوتية' },
      { name: 'دي جي النجوم',            price: 3500, rating: 5, desc: 'حفلات راقية مع أجواء عالمية' },
      { name: 'ميكس الأفراح',            price: 2000, rating: 4, desc: 'ميكسات حصرية لحفلات الزفاف' }
    ],
    srv_7: [
      { name: 'إضاءة الحدث',            price: 3000, rating: 4, desc: 'إضاءة LED ملونة مع تحكم ذكي' },
      { name: 'نور الفخامة',             price: 4500, rating: 5, desc: 'ليزر + إضاءة معمارية + ضباب' },
      { name: 'أضواء الليل',             price: 2000, rating: 3, desc: 'إضاءة أساسية مع سبوت لايت' },
      { name: 'تقنيات النور',            price: 3500, rating: 4, desc: 'إضاءة مسرحية احترافية' }
    ],
    srv_8: [
      { name: 'صالون الجمال الملكي',      price: 2500, rating: 5, desc: 'مكياج عروس + تسريحة + عناية' },
      { name: 'مكياج الأميرات',           price: 1800, rating: 4, desc: 'لوك طبيعي فاخر' },
      { name: 'بيوتي لاونج',             price: 2000, rating: 4, desc: 'مكياج سينمائي مع عدسات' },
      { name: 'صالون التألق',            price: 1500, rating: 3, desc: 'مكياج وتسريحة كلاسيكية' },
      { name: 'ذا بيوتي هاوس',           price: 3000, rating: 5, desc: 'باقة كاملة: مكياج + شعر + أظافر + سبا' }
    ],
    srv_9: [
      { name: 'ديكور الأحلام',           price: 5000, rating: 5, desc: 'كوشة ملكية مع أزهار طبيعية' },
      { name: 'كوشة الملكة',             price: 3500, rating: 4, desc: 'تصميم كلاسيكي أنيق' },
      { name: 'تصميم الزهور',            price: 4000, rating: 4, desc: 'تنسيقات زهور هولندية فاخرة' },
      { name: 'ديكور السحر',             price: 2500, rating: 3, desc: 'ديكور عصري بأسعار مناسبة' }
    ],
    srv_10: [
      { name: 'بوتيك العروس الفاخر',     price: 8000, rating: 5, desc: 'فساتين مصممين عالميين' },
      { name: 'أزياء الفخامة',           price: 5000, rating: 4, desc: 'فساتين مستوردة من إيطاليا' },
      { name: 'دار الموضة',              price: 3500, rating: 3, desc: 'تشكيلة متنوعة من الفساتين' },
      { name: 'بوتيك الأناقة',           price: 6000, rating: 4, desc: 'تصميم حسب الطلب مع تطريز يدوي' }
    ],
    srv_11: [
      { name: 'مطبعة الإبداع',           price: 1500, rating: 4, desc: 'كروت دعوة فاخرة مع ختم ذهبي' },
      { name: 'تصاميم الدعوة',           price: 800,  rating: 3, desc: 'دعوات إلكترونية وورقية' },
      { name: 'كارت الفرح',              price: 1200, rating: 4, desc: 'تصميم حصري مع صندوق هدية' },
      { name: 'دعوات VIP',               price: 2000, rating: 5, desc: 'بطاقات أكريليك مع نقش ليزر' }
    ],
    srv_12: [
      { name: 'حلويات السعادة',          price: 3000, rating: 4, desc: 'كيك زفاف 5 طبقات + حلويات' },
      { name: 'كيك الأحلام',             price: 4000, rating: 5, desc: 'كيك فوندان مصمم حسب الثيم' },
      { name: 'حلويات الفخامة',          price: 2500, rating: 4, desc: 'تشكيلة حلويات شرقية وغربية' },
      { name: 'سويت لاونج',              price: 2000, rating: 3, desc: 'ركن حلويات مع شوكولاتة فاخرة' },
      { name: 'ماستر كيك',               price: 5000, rating: 5, desc: 'كيك فني 7 طبقات مع عرض مباشر' }
    ]
  };

  let counter = 1;
  for (const srvId in vendorData) {
    const srvVendors = vendorData[srvId];
    const isPerPerson = srvId === 'srv_3' || srvId === 'srv_4';
    srvVendors.forEach(v => {
      vendors.push({
        id: 'ven_' + counter,
        role: 'vendor',
        name: v.name,
        email: 'v' + counter + '@wedding.com',
        password: '123',
        phone: '05' + String(Math.floor(10000000 + Math.random() * 90000000)),
        price: v.price,
        pricingType: isPerPerson || v.perPerson ? 'perPerson' : 'flat',
        maxCapacity: v.capacity || null,
        serviceId: srvId,
        rating: v.rating,
        description: v.desc,
        notes: '',
        photos: [],
        createdAt: new Date().toISOString()
      });
      counter++;
    });
  }
  return vendors;
}

// ─── Default Users ──────────────────────────────────────────

const defaultUsers = [
  { id: 'org_1', role: 'organizer', name: 'مدير النظام', email: 'admin', password: 'admin', createdAt: new Date().toISOString() },
  ...generateMockVendors()
];

// ─── Default Checklist Template ─────────────────────────────

const defaultChecklist = [
  { id: 'chk_1',  text: 'حجز القاعة',                category: '6months', order: 1 },
  { id: 'chk_2',  text: 'اختيار المصور والمصور الفيديو', category: '6months', order: 2 },
  { id: 'chk_3',  text: 'حجز الكاترينج',              category: '6months', order: 3 },
  { id: 'chk_4',  text: 'اختيار الفستان',              category: '3months', order: 4 },
  { id: 'chk_5',  text: 'طباعة الدعوات',               category: '3months', order: 5 },
  { id: 'chk_6',  text: 'حجز الزفة والدي جي',          category: '3months', order: 6 },
  { id: 'chk_7',  text: 'تجربة المكياج',               category: '1month',  order: 7 },
  { id: 'chk_8',  text: 'تأكيد جميع الحجوزات',          category: '1month',  order: 8 },
  { id: 'chk_9',  text: 'ترتيب الديكور والكوشة',        category: '1month',  order: 9 },
  { id: 'chk_10', text: 'توزيع الدعوات',               category: '1month',  order: 10 },
  { id: 'chk_11', text: 'تأكيد عدد الحضور النهائي',     category: '1week',   order: 11 },
  { id: 'chk_12', text: 'تجهيز حقيبة العروس',          category: '1week',   order: 12 },
  { id: 'chk_13', text: 'بروفة يوم الزفاف',            category: '1week',   order: 13 },
  { id: 'chk_14', text: 'تسليم القاعة للمنسق',          category: 'dayof',   order: 14 },
  { id: 'chk_15', text: 'التأكد من وصول جميع المزودين',  category: 'dayof',   order: 15 }
];

// ═══════════════════════════════════════════════════════════════
// DATABASE INITIALIZATION
// ═══════════════════════════════════════════════════════════════

window.db.init = function() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject('IndexedDB Error');

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('users'))         db.createObjectStore('users', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('services'))      db.createObjectStore('services', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('bookings'))      db.createObjectStore('bookings', { keyPath: 'vendorId' });
      if (!db.objectStoreNames.contains('clients'))       db.createObjectStore('clients', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('plans'))         db.createObjectStore('plans', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) {
        const ns = db.createObjectStore('notifications', { keyPath: 'id' });
        ns.createIndex('vendorId', 'vendorId', { unique: false });
      }
      if (!db.objectStoreNames.contains('reviews')) {
        const rs = db.createObjectStore('reviews', { keyPath: 'id' });
        rs.createIndex('vendorId', 'vendorId', { unique: false });
      }
      if (!db.objectStoreNames.contains('checklists'))    db.createObjectStore('checklists', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('activityLog'))   db.createObjectStore('activityLog', { keyPath: 'id' });
    };

    request.onsuccess = async (e) => {
      idbInstance = e.target.result;
      // Seed if empty
      const users = await window.db.getAll('users');
      if (users.length === 0) {
        for (const srv of defaultServices)     await window.db.put('services', srv);
        for (const user of defaultUsers) {
          await window.db.put('users', user);
          if (user.role === 'vendor')          await window.db.put('bookings', { vendorId: user.id, dates: [] });
        }
        for (const item of defaultChecklist)   await window.db.put('checklists', { ...item, planId: 'template', done: false });
        await window.db.logActivity('system', 'تم تهيئة قاعدة البيانات بنجاح');
      }
      resolve();
    };
  });
};

// ═══════════════════════════════════════════════════════════════
// GENERIC CRUD
// ═══════════════════════════════════════════════════════════════

window.db.getAll = function(storeName) {
  return new Promise((resolve, reject) => {
    const tx = idbInstance.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

window.db.get = function(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = idbInstance.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

window.db.put = function(storeName, item) {
  return new Promise((resolve, reject) => {
    const tx = idbInstance.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

window.db.delete = function(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = idbInstance.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

window.db.login = async function(email, password) {
  const users = await window.db.getAll('users');
  return users.find(u => u.email === email && u.password === password) || null;
};

// ═══════════════════════════════════════════════════════════════
// SERVICES API
// ═══════════════════════════════════════════════════════════════

window.db.getServices = async function() {
  return await window.db.getAll('services');
};
window.db.addService = async function(name, icon, color) {
  const s = { id: 'srv_' + Date.now(), name, icon: icon || 'fa-star', color: color || '#888' };
  await window.db.put('services', s);
  return s;
};
window.db.updateService = async function(service) {
  await window.db.put('services', service);
};
window.db.removeService = async function(id) {
  await window.db.delete('services', id);
};

// ═══════════════════════════════════════════════════════════════
// VENDORS API
// ═══════════════════════════════════════════════════════════════

window.db.getVendors = async function() {
  const users = await window.db.getAll('users');
  return users.filter(u => u.role === 'vendor');
};
window.db.getVendor = async function(id) {
  return await window.db.get('users', id);
};
window.db.addVendor = async function(vendor) {
  const v = { id: 'ven_' + Date.now(), role: 'vendor', photos: [], rating: 0, description: '', notes: '', createdAt: new Date().toISOString(), ...vendor };
  await window.db.put('users', v);
  await window.db.put('bookings', { vendorId: v.id, dates: [] });
  await window.db.logActivity('vendor', 'تمت إضافة مزود جديد: ' + v.name);
  return v;
};
window.db.updateVendor = async function(vendor) {
  await window.db.put('users', vendor);
};
window.db.deleteVendor = async function(id) {
  await window.db.delete('users', id);
  await window.db.delete('bookings', id);
  await window.db.logActivity('vendor', 'تم حذف مزود');
};

// ═══════════════════════════════════════════════════════════════
// BOOKINGS API
// ═══════════════════════════════════════════════════════════════

window.db.getVendorBookings = async function(vendorId) {
  const b = await window.db.get('bookings', vendorId);
  return b ? b.dates : [];
};
window.db.toggleVendorBooking = async function(vendorId, dateStr) {
  let b = await window.db.get('bookings', vendorId);
  if (!b) b = { vendorId, dates: [] };
  const idx = b.dates.indexOf(dateStr);
  if (idx > -1) b.dates.splice(idx, 1);
  else b.dates.push(dateStr);
  await window.db.put('bookings', b);
  return b.dates;
};
window.db.addBookingDate = async function(vendorId, dateStr) {
  let b = await window.db.get('bookings', vendorId);
  if (!b) b = { vendorId, dates: [] };
  if (!b.dates.includes(dateStr)) {
    b.dates.push(dateStr);
    await window.db.put('bookings', b);
  }
};

// ═══════════════════════════════════════════════════════════════
// CLIENTS API
// ═══════════════════════════════════════════════════════════════

window.db.getClients = async function() {
  return await window.db.getAll('clients');
};
window.db.getClient = async function(id) {
  return await window.db.get('clients', id);
};
window.db.addClient = async function(client) {
  const c = { id: 'cli_' + Date.now(), status: 'active', createdAt: new Date().toISOString(), ...client };
  await window.db.put('clients', c);
  await window.db.logActivity('client', 'تم تسجيل عميل جديد: ' + c.name);
  return c;
};
window.db.updateClient = async function(client) {
  await window.db.put('clients', client);
};
window.db.deleteClient = async function(id) {
  await window.db.delete('clients', id);
  await window.db.logActivity('client', 'تم حذف عميل');
};

// ═══════════════════════════════════════════════════════════════
// PLANS / RESERVATIONS API
// ═══════════════════════════════════════════════════════════════

window.db.getPlans = async function() {
  return await window.db.getAll('plans');
};
window.db.getPlan = async function(id) {
  return await window.db.get('plans', id);
};
window.db.updatePlan = async function(plan) {
  await window.db.put('plans', plan);
};

window.db.reservePlan = async function(clientId, dateStr, vendorIds, organizerName, guests) {
  const client = clientId ? await window.db.get('clients', clientId) : null;
  const plan = {
    id: 'plan_' + Date.now(),
    clientId: clientId || null,
    clientName: client ? client.name : 'عميل غير مسجل',
    dateStr,
    vendorIds,
    guests,
    status: 'confirmed',
    totalCost: 0,
    createdAt: new Date().toISOString()
  };

  // Calculate total cost
  let total = 0;
  for (const vId of vendorIds) {
    const vendor = await window.db.get('users', vId);
    if (vendor) {
      total += vendor.pricingType === 'perPerson' ? vendor.price * guests : vendor.price;
    }
  }
  plan.totalCost = total;

  await window.db.put('plans', plan);

  // Update client status if linked
  if (client) {
    client.status = 'booked';
    await window.db.put('clients', client);
  }

  // Book dates and notify vendors
  for (const vId of vendorIds) {
    await window.db.addBookingDate(vId, dateStr);
    const vendor = await window.db.get('users', vId);
    await window.db.addNotification(vId, 'حجز زفاف جديد!', {
      planId: plan.id,
      clientName: plan.clientName,
      organizerName,
      date: dateStr,
      guests
    });
  }

  await window.db.logActivity('plan', 'تم إنشاء خطة زفاف جديدة بتاريخ ' + dateStr);
  return plan;
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════

window.db.addNotification = async function(vendorId, message, details) {
  const n = { id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), vendorId, message, details, date: new Date().toISOString(), read: false };
  await window.db.put('notifications', n);
  return n;
};
window.db.getVendorNotifications = async function(vendorId) {
  const all = await window.db.getAll('notifications');
  return all.filter(n => n.vendorId === vendorId).sort((a, b) => new Date(b.date) - new Date(a.date));
};
window.db.markNotificationRead = async function(id) {
  const n = await window.db.get('notifications', id);
  if (n) { n.read = true; await window.db.put('notifications', n); }
};
window.db.markAllNotificationsRead = async function(vendorId) {
  const all = await window.db.getAll('notifications');
  for (const n of all) {
    if (n.vendorId === vendorId && !n.read) {
      n.read = true;
      await window.db.put('notifications', n);
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// REVIEWS API
// ═══════════════════════════════════════════════════════════════

window.db.addReview = async function(vendorId, reviewerName, rating, comment) {
  const r = { id: 'rev_' + Date.now(), vendorId, reviewerName, rating, comment, date: new Date().toISOString() };
  await window.db.put('reviews', r);

  // Update vendor average rating
  const reviews = await window.db.getVendorReviews(vendorId);
  const avg = Math.round(reviews.reduce((s, rv) => s + rv.rating, 0) / reviews.length);
  const vendor = await window.db.get('users', vendorId);
  if (vendor) { vendor.rating = avg; await window.db.put('users', vendor); }

  return r;
};
window.db.getVendorReviews = async function(vendorId) {
  const all = await window.db.getAll('reviews');
  return all.filter(r => r.vendorId === vendorId).sort((a, b) => new Date(b.date) - new Date(a.date));
};

// ═══════════════════════════════════════════════════════════════
// CHECKLIST API
// ═══════════════════════════════════════════════════════════════

window.db.getChecklist = async function(planId) {
  const all = await window.db.getAll('checklists');
  return all.filter(c => c.planId === planId).sort((a, b) => a.order - b.order);
};
window.db.addChecklistItem = async function(item) {
  const c = { id: 'chk_' + Date.now(), done: false, ...item };
  await window.db.put('checklists', c);
  return c;
};
window.db.updateChecklistItem = async function(item) {
  await window.db.put('checklists', item);
};
window.db.deleteChecklistItem = async function(id) {
  await window.db.delete('checklists', id);
};
window.db.cloneChecklistForPlan = async function(planId) {
  const template = await window.db.getChecklist('template');
  for (const item of template) {
    await window.db.addChecklistItem({
      text: item.text,
      category: item.category,
      order: item.order,
      planId: planId,
      done: false
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG API
// ═══════════════════════════════════════════════════════════════

window.db.logActivity = async function(type, message) {
  const entry = { id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), type, message, date: new Date().toISOString() };
  await window.db.put('activityLog', entry);
  return entry;
};
window.db.getActivityLog = async function(limit) {
  const all = await window.db.getAll('activityLog');
  const sorted = all.sort((a, b) => new Date(b.date) - new Date(a.date));
  return limit ? sorted.slice(0, limit) : sorted;
};

// ═══════════════════════════════════════════════════════════════
// SEARCH / AVAILABILITY HELPERS (Raw queries)
// ═══════════════════════════════════════════════════════════════

window.db.searchAvailableVendors = async function(dateStr, serviceId) {
  const vendors = await window.db.getVendors();
  const results = [];
  for (const v of vendors) {
    if (serviceId && serviceId !== 'all' && v.serviceId !== serviceId) continue;
    if (dateStr) {
      const dates = await window.db.getVendorBookings(v.id);
      if (dates.includes(dateStr)) continue;
    }
    results.push(v);
  }
  return results;
};
