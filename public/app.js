// ═══════════════════════════════════════════════════════════════
// LAYER 3 (Part B): APPLICATION — Routing, Navigation & Views
// Uses: window.db (Layer 1), window.Services (Layer 2), window.UI (Components)
// ═══════════════════════════════════════════════════════════════

const app = document.getElementById('app');
let currentUser = null;
let cart = { clientId: '', date: '', guests: 100, vendors: [] };
let compareList = []; // vendor IDs to compare

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════

function initTheme() {
  document.body.className = localStorage.getItem('theme') || 'light-mode';
}
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  document.body.className = isDark ? 'light-mode' : 'dark-mode';
  localStorage.setItem('theme', document.body.className);
}

// ═══════════════════════════════════════════════════════════════
// MAIN ROUTER
// ═══════════════════════════════════════════════════════════════

function render() {
  app.innerHTML = '';
  if (!currentUser) return renderLogin();
  if (currentUser.role === 'organizer') renderOrganizerLayout();
  else if (currentUser.role === 'vendor') renderVendorLayout();
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════

function renderLogin() {
  app.innerHTML =
    '<div class="auth-container">' +
      '<div class="auth-card">' +
        '<div class="auth-logo"><i class="fa-solid fa-ring"></i></div>' +
        '<h1 class="auth-title">منصة تنظيم الزفاف</h1>' +
        '<p class="auth-subtitle">سجل دخولك للبدء في تخطيط حفلات الزفاف</p>' +
        '<form id="login-form">' +
          '<div class="form-group"><label>البريد / اسم المستخدم</label><input type="text" id="email" required placeholder="admin أو v1@wedding.com"></div>' +
          '<div class="form-group"><label>كلمة المرور</label><input type="password" id="password" required placeholder="كلمة المرور"></div>' +
          '<button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top:8px;">دخول <i class="fa-solid fa-arrow-left"></i></button>' +
        '</form>' +
        '<p style="margin-top:24px; color: rgba(255,255,255,0.35); font-size:0.82rem;">المنظم: admin / admin | المزود: v1@wedding.com / 123</p>' +
      '</div>' +
    '</div>';

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await window.db.login(
      document.getElementById('email').value.trim(),
      document.getElementById('password').value
    );
    if (user) {
      currentUser = user;
      window.UI.toast('مرحباً ' + user.name, 'success');
      render();
    } else {
      window.UI.toast('بيانات الدخول غير صحيحة', 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZER LAYOUT
// ═══════════════════════════════════════════════════════════════

function renderOrganizerLayout() {
  app.innerHTML =
    '<div class="dashboard">' +
      '<div class="sidebar">' +
        '<div class="sidebar-header"><i class="fa-solid fa-ring"></i><span>المنظم</span></div>' +
        '<div class="sidebar-subtitle">لوحة تحكم المنظم</div>' +

        '<div class="sidebar-section">الرئيسية</div>' +
        '<a class="nav-link active" id="nav-dashboard"><i class="fa-solid fa-chart-pie"></i><span>لوحة المعلومات</span></a>' +
        '<a class="nav-link" id="nav-plan"><i class="fa-solid fa-wand-magic-sparkles"></i><span>بناء خطة الزفاف</span></a>' +

        '<div class="sidebar-section">الإدارة</div>' +
        '<a class="nav-link" id="nav-clients"><i class="fa-solid fa-user-group"></i><span>العملاء</span></a>' +
        '<a class="nav-link" id="nav-vendors"><i class="fa-solid fa-store"></i><span>المزودين</span></a>' +
        '<a class="nav-link" id="nav-reservations"><i class="fa-solid fa-calendar-check"></i><span>الحجوزات</span></a>' +

        '<div class="sidebar-section">الأدوات</div>' +
        '<a class="nav-link" id="nav-reports"><i class="fa-solid fa-chart-bar"></i><span>التقارير</span></a>' +
        '<a class="nav-link" id="nav-checklist"><i class="fa-solid fa-list-check"></i><span>قائمة المهام</span></a>' +
        '<a class="nav-link" id="nav-settings"><i class="fa-solid fa-gear"></i><span>الإعدادات</span></a>' +

        '<div class="sidebar-footer">' +
          '<button class="btn btn-ghost w-full" id="btn-theme"><i class="fa-solid fa-moon"></i><span>تغيير المظهر</span></button>' +
          '<button class="btn btn-danger btn-sm w-full" id="btn-logout"><i class="fa-solid fa-right-from-bracket"></i><span>خروج</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="main-content" id="main-content"></div>' +
    '</div>';

  document.getElementById('btn-logout').addEventListener('click', () => {
    window.db.logout();
    currentUser = null;
    cart = { clientId: '', date: '', guests: 100, vendors: [] };
    compareList = [];
    render();
  });
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  const navIds = ['nav-dashboard', 'nav-plan', 'nav-clients', 'nav-vendors', 'nav-reservations', 'nav-reports', 'nav-checklist', 'nav-settings'];
  const content = document.getElementById('main-content');

  const switchTab = (tabId) => {
    navIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    content.innerHTML = window.UI.loading();
    content.scrollTop = 0;

    switch (tabId) {
      case 'nav-dashboard':    renderOrgDashboard(content); break;
      case 'nav-plan':         renderOrgPlan(content); break;
      case 'nav-clients':      renderOrgClients(content); break;
      case 'nav-vendors':      renderOrgVendors(content); break;
      case 'nav-reservations': renderOrgReservations(content); break;
      case 'nav-reports':      renderOrgReports(content); break;
      case 'nav-checklist':    renderOrgChecklist(content); break;
      case 'nav-settings':     renderOrgSettings(content); break;
    }
  };

  navIds.forEach(id => document.getElementById(id).addEventListener('click', () => switchTab(id)));
  switchTab('nav-dashboard');
}

// ═══════════════════════════════════════════════════════════════
// 1. ORGANIZER DASHBOARD
// ═══════════════════════════════════════════════════════════════

async function renderOrgDashboard(container) {
  const stats = await window.Services.Statistics.getDashboardStats();
  const recentActivity = await window.db.getActivityLog(8);

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title">مرحباً، ' + currentUser.name + '</h1><p class="page-subtitle">لوحة المعلومات الرئيسية</p></div></div>' +

      '<div class="stats-grid">' +
        window.UI.statWidget('fa-store', 'المزودين', stats.totalVendors, 'rgba(59,130,246,0.15)', 'var(--info)') +
        window.UI.statWidget('fa-user-group', 'العملاء', stats.totalClients, 'rgba(16,185,129,0.15)', 'var(--success)') +
        window.UI.statWidget('fa-calendar-check', 'الحجوزات', stats.totalPlans, 'rgba(201,162,39,0.15)', 'var(--primary)') +
        window.UI.statWidget('fa-champagne-glasses', 'أفراح قادمة', stats.upcomingWeddings, 'rgba(239,68,68,0.15)', 'var(--danger)') +
        window.UI.statWidget('fa-layer-group', 'أنواع الخدمات', stats.totalServices, 'rgba(139,92,246,0.15)', '#8b5cf6') +
        window.UI.statWidget('fa-coins', 'إجمالي الإيرادات', window.Services.Pricing.formatPrice(stats.totalRevenue), 'rgba(245,158,11,0.15)', 'var(--warning)') +
      '</div>' +

      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">' +
        '<div class="card">' +
          '<h3 style="margin-bottom: 16px; font-weight: 800;"><i class="fa-solid fa-clock-rotate-left"></i> آخر النشاطات</h3>' +
          '<div id="activity-feed"></div>' +
        '</div>' +
        '<div class="card">' +
          '<h3 style="margin-bottom: 16px; font-weight: 800;"><i class="fa-solid fa-bolt"></i> إجراءات سريعة</h3>' +
          '<div style="display:flex; flex-direction:column; gap:10px;">' +
            '<button class="btn btn-primary w-full" id="qa-plan"><i class="fa-solid fa-wand-magic-sparkles"></i> بناء خطة جديدة</button>' +
            '<button class="btn btn-outline w-full" id="qa-client"><i class="fa-solid fa-user-plus"></i> إضافة عميل</button>' +
            '<button class="btn btn-outline w-full" id="qa-vendor"><i class="fa-solid fa-store"></i> إضافة مزود</button>' +
            '<button class="btn btn-outline w-full" id="qa-report"><i class="fa-solid fa-chart-bar"></i> عرض التقارير</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Activity feed
  const feedEl = document.getElementById('activity-feed');
  if (recentActivity.length === 0) {
    feedEl.innerHTML = window.UI.emptyState('fa-clock-rotate-left', 'لا توجد نشاطات', 'ستظهر هنا أحدث العمليات');
  } else {
    feedEl.innerHTML = recentActivity.map(a => window.UI.activityItem(a)).join('');
  }

  // Quick actions
  document.getElementById('qa-plan').addEventListener('click', () => {
    document.getElementById('nav-plan').click();
  });
  document.getElementById('qa-client').addEventListener('click', () => {
    document.getElementById('nav-clients').click();
  });
  document.getElementById('qa-vendor').addEventListener('click', () => {
    document.getElementById('nav-vendors').click();
  });
  document.getElementById('qa-report').addEventListener('click', () => {
    document.getElementById('nav-reports').click();
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. ORGANIZER PLAN BUILDER (Main feature)
// ═══════════════════════════════════════════════════════════════

async function renderOrgPlan(container) {
  const services = await window.db.getServices();
  const clients = await window.db.getClients();

  let clientOptions = '<option value="">— اختر عميلاً (مطلوب) —</option>';
  clients.forEach(c => {
    const sel = cart.clientId === c.id ? 'selected' : '';
    clientOptions += '<option value="' + c.id + '" ' + sel + '>' + c.name + (c.budget ? ' — ميزانية: ' + window.Services.Pricing.formatPrice(Number(c.budget)) : ' — مفتوحة') + '</option>';
  });

  let pillsHtml = '<div class="pill active" data-id="all"><i class="fa-solid fa-grip"></i> الكل</div>';
  services.forEach(s => {
    pillsHtml += '<div class="pill" data-id="' + s.id + '"><i class="fa-solid ' + s.icon + '"></i> ' + s.name + '</div>';
  });

  const plans = await window.db.getPlans();
  let draftOptions = '<option value="">اختر مسودة مسجلة...</option>';
  plans.filter(p => p.status === 'draft').forEach(p => {
    draftOptions += `<option value="${p._id || p.id}">${p.clientName} - ${p.name || 'خطة'} (${p.dateStr})</option>`;
  });

  container.innerHTML =
    '<div class="search-layout" style="height:100%;">' +
      '<div class="search-main" style="height:100%; overflow-y:auto;">' +
        '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--primary);"></i> بناء خطة الزفاف</h1><p class="page-subtitle">اختر الخدمات وأضفها للسلة لبناء خطة متكاملة</p></div></div>' +

        '<div class="search-filters">' +
          '<div class="form-group"><label><i class="fa-solid fa-calendar"></i> التاريخ</label><input type="date" id="plan-date" value="' + cart.date + '"></div>' +
          '<div class="form-group"><label><i class="fa-solid fa-users"></i> عدد الحضور</label><input type="number" id="plan-guests" value="' + cart.guests + '" min="1"></div>' +
          '<div class="form-group"><label><i class="fa-solid fa-user"></i> ربط بعميل</label><select id="plan-client">' + clientOptions + '</select></div>' +
          '<div class="form-group"><label><i class="fa-solid fa-search"></i> بحث</label><input type="text" id="plan-search" placeholder="ابحث بالاسم..."></div>' +
        '</div>' +

        '<div class="category-pills" id="cat-pills">' + pillsHtml + '</div>' +

        '<div class="sort-controls">' +
          '<span class="text-sm text-muted" style="margin-left:8px;">ترتيب:</span>' +
          '<button class="sort-btn active" data-sort="default">افتراضي</button>' +
          '<button class="sort-btn" data-sort="price-asc"><i class="fa-solid fa-arrow-up-short-wide"></i> السعر ↑</button>' +
          '<button class="sort-btn" data-sort="price-desc"><i class="fa-solid fa-arrow-down-wide-short"></i> السعر ↓</button>' +
          '<button class="sort-btn" data-sort="rating-desc"><i class="fa-solid fa-star"></i> التقييم</button>' +
          '<button class="sort-btn" data-sort="name-asc"><i class="fa-solid fa-arrow-down-a-z"></i> الاسم</button>' +
        '</div>' +

        '<div id="compare-bar" style="display:none;" class="card mb-16" style="padding:12px;"></div>' +
        '<div id="vendors-grid" class="grid"></div>' +
      '</div>' +

      '<div class="cart-sidebar">' +
        '<div class="cart-header"><i class="fa-solid fa-clipboard-list" style="color:var(--primary); font-size:1.3rem;"></i><h3>سلة التخطيط</h3><div class="cart-count" id="cart-count">0</div></div>' +
        '<div style="max-height:60vh; overflow-y:auto; padding-left:4px;">' +
          '<div class="form-group"><label>اسم الخطة</label><input type="text" id="plan-name" value="' + (cart.name || 'خطة مقترحة') + '"></div>' +
          '<div class="form-row" style="display:flex; gap:8px;">' +
            '<div class="form-group" style="flex:1;"><label>نوع المناسبة</label><select id="event-type"><option value="زفاف">💍 زفاف</option><option value="خطوبة">💎 خطوبة</option><option value="عقد قران">📜 عقد قران</option><option value="حفل تخرج">🎓 حفل تخرج</option><option value="أخرى">📅 أخرى</option></select></div>' +
            '<div class="form-group" style="flex:1;"><label>الوقت</label><select id="event-time"><option value="مسائي">🌙 مسائي</option><option value="صباحي">☀️ صباحي</option></select></div>' +
          '</div>' +
          '<div class="form-group"><label>مكان المناسبة</label><input type="text" id="plan-venue" placeholder="مثال: قاعة الهيلتون"></div>' +
          '<div class="divider" style="margin:12px 0;"></div>' +
          '<div class="form-group"><label>اسم الحاجز</label><input type="text" id="booker-name" placeholder="اسم الشخص الذي قام بالحجز"></div>' +
          '<div class="form-group"><label>مصدر الحجز</label><select id="booker-source"><option value="website">🌐 الموقع الإلكتروني</option><option value="organizer">👤 منظم حفلات</option><option value="external">📞 مصدر خارجي</option></select></div>' +
          '<div class="form-group"><label>جهات الاتصال</label><div id="contacts-container" class="contacts-list"></div><button type="button" class="btn-add-contact" id="btn-add-contact"><i class="fa-solid fa-plus"></i> إضافة جهة اتصال</button></div>' +
          '<div class="form-group"><label>ملاحظات</label><textarea id="plan-notes" rows="2" placeholder="ملاحظات إضافية..."></textarea></div>' +
          '<div class="form-group"><label>طلبات خاصة</label><textarea id="special-requests" rows="2" placeholder="أي متطلبات خاصة للمناسبة..."></textarea></div>' +
          '<div class="divider" style="margin:12px 0;"></div>' +
          '<div class="form-group"><label>تحميل مسودة</label><select id="plan-load">' + draftOptions + '</select></div>' +
        '</div>' +
        '<div class="cart-items" id="cart-items" style="max-height:25vh;"></div>' +
        '<div class="cart-summary">' +
          '<div id="budget-progress"></div>' +
          '<div class="cart-total"><span>الإجمالي:</span><span id="cart-sum">0 شيكل</span></div>' +
          '<div id="budget-warn"></div>' +
          '<div style="display:flex; gap:8px; margin-top:12px;">' +
            '<button class="btn btn-outline flex-1" id="btn-draft"><i class="fa-solid fa-save"></i> حفظ كمسودة</button>' +
            '<button class="btn btn-success flex-1" id="btn-reserve"><i class="fa-solid fa-check-double"></i> اعتماد الخطة</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  let currentFilter = 'all';
  let currentSort = 'default';
  let searchQuery = '';

  // ─── Update Cart UI ────────────────────────────────────────
  const updateCartUI = () => {
    const guests = parseInt(document.getElementById('plan-guests').value) || 100;
    const dateStr = document.getElementById('plan-date').value;
    const total = window.Services.Pricing.calculateCartTotal(cart.vendors, guests, dateStr);

    document.getElementById('cart-count').textContent = cart.vendors.length;
    document.getElementById('cart-sum').textContent = window.Services.Pricing.formatPrice(total);

    const itemsEl = document.getElementById('cart-items');
    if (cart.vendors.length === 0) {
      itemsEl.innerHTML = window.UI.emptyState('fa-clipboard-list', 'السلة فارغة', 'أضف خدمات من القائمة');
    } else {
      let html = '';
      cart.vendors.forEach((v, i) => {
        const cost = window.Services.Pricing.calculateVendorCost(v, guests, dateStr);
        const baseCost = window.Services.Pricing.calculateVendorCost(v, guests); // without date
        const surcharge = cost - baseCost;
        let costLabel = v.pricingType === 'perPerson'
          ? v.price + ' × ' + guests + ' = ' + window.Services.Pricing.formatPrice(baseCost)
          : window.Services.Pricing.formatPrice(baseCost);
        if (surcharge > 0) {
          costLabel += ' <span style="color:var(--warning); font-size:0.8rem;">+' + window.Services.Pricing.formatPrice(surcharge) + '</span>';
        }
        html += '<div class="cart-item">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">' + v.name + '</div>' +
            '<div class="cart-item-price">' + costLabel + '</div>' +
          '</div>' +
          '<button class="btn btn-danger btn-icon btn-sm" onclick="window._removeFromCart(' + i + ')"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>';
      });
      itemsEl.innerHTML = html;
    }

    // Budget check
    const cId = document.getElementById('plan-client').value;
    const client = clients.find(c => c.id === cId);
    const budgetEl = document.getElementById('budget-progress');
    const warnEl = document.getElementById('budget-warn');

    if (client && client.budget && Number(client.budget) > 0) {
      const bs = window.Services.Pricing.getBudgetStatus(total, Number(client.budget));
      budgetEl.innerHTML = '<div class="text-sm mb-8" style="display:flex;justify-content:space-between;"><span>الميزانية</span><span>' + window.Services.Pricing.formatPrice(Number(client.budget)) + '</span></div>' +
        window.UI.progressBar(bs.percentage, bs.color);
      if (bs.status === 'over') {
        warnEl.innerHTML = '<div class="budget-warning"><i class="fa-solid fa-triangle-exclamation"></i> التكلفة تتجاوز الميزانية بـ ' + window.Services.Pricing.formatPrice(Math.abs(bs.remaining)) + '</div>';
      } else if (bs.status === 'warning') {
        warnEl.innerHTML = '<div class="budget-warning" style="background:var(--warning-light);color:var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i> اقتربت من الميزانية! متبقي: ' + window.Services.Pricing.formatPrice(bs.remaining) + '</div>';
      } else {
        warnEl.innerHTML = '';
      }
    } else {
      budgetEl.innerHTML = '';
      warnEl.innerHTML = '';
    }
  };

  // ─── Global Cart Functions ─────────────────────────────────
  window._removeFromCart = (idx) => {
    cart.vendors.splice(idx, 1);
    updateCartUI();
    loadVendors();
  };
  window._addToCart = (vendorId) => {
    if (cart.vendors.find(v => v.id === vendorId)) {
      window.UI.toast('المزود موجود مسبقاً في السلة!', 'warning');
      return;
    }
    const vObj = window._planVendors.find(v => v.id === vendorId);
    if (vObj) {
      cart.vendors.push(vObj);
      window.UI.toast('تمت الإضافة: ' + vObj.name, 'success');
    }
    updateCartUI();
    loadVendors();
  };
  window._toggleCompare = (vendorId) => {
    const idx = compareList.indexOf(vendorId);
    if (idx > -1) { compareList.splice(idx, 1); }
    else if (compareList.length < 3) { compareList.push(vendorId); }
    else { window.UI.toast('يمكنك مقارنة 3 مزودين كحد أقصى', 'warning'); return; }
    loadVendors();
    updateCompareBar();
  };

  // ─── Compare Bar ───────────────────────────────────────────
  const updateCompareBar = async () => {
    const bar = document.getElementById('compare-bar');
    if (compareList.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    const guests = parseInt(document.getElementById('plan-guests').value) || 100;
    const vendorsToCompare = await window.Services.Comparison.compareVendors(compareList, guests);
    const allServices = await window.db.getServices();
    bar.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<h3 style="font-weight:800;">مقارنة المزودين (' + compareList.length + '/3)</h3>' +
      '<button class="btn btn-ghost btn-sm" onclick="window._clearCompare()"><i class="fa-solid fa-xmark"></i> مسح</button></div>' +
      window.UI.comparisonTable(vendorsToCompare, allServices, guests);
  };
  window._clearCompare = () => {
    compareList = [];
    updateCompareBar();
    loadVendors();
  };

  // ─── Load & Display Vendors ────────────────────────────────
  const loadVendors = async () => {
    const date = document.getElementById('plan-date').value;
    const guests = parseInt(document.getElementById('plan-guests').value) || 100;
    cart.date = date;
    cart.guests = guests;
    cart.clientId = document.getElementById('plan-client').value;

    // Get available vendors for date
    let available = await window.db.searchAvailableVendors(date, currentFilter);

    // Apply text search
    available = window.Services.Search.filterVendors(available, { query: searchQuery });

    // Apply sort
    if (currentSort !== 'default') {
      const [field, dir] = currentSort.split('-');
      available = window.Services.Search.sortVendors(available, field, dir);
    }

    window._planVendors = available;
    const grid = document.getElementById('vendors-grid');

    if (available.length === 0) {
      grid.innerHTML = window.UI.emptyState('fa-search', 'لا يوجد مزودين', 'جرب تغيير الفلاتر أو التاريخ');
      return;
    }

    let html = '';
    available.forEach(v => {
      const isInCart = !!cart.vendors.find(cv => cv.id === v.id);
      const cap = window.Services.Availability.checkCapacity(v, guests);
      const isOverCapacity = !cap.fits;
      const srv = services.find(s => s.id === v.serviceId);
      const isComparing = compareList.includes(v.id);

      html += window.UI.vendorCard(v, srv ? srv.name : '', {
        isInCart,
        isOverCapacity,
        onAdd: "window._addToCart('" + v.id + "')",
        onCompare: "window._toggleCompare('" + v.id + "')"
      });
    });
    grid.innerHTML = html;

    // Highlight compare buttons
    document.querySelectorAll('.card .btn-outline').forEach(btn => {
      const onclick = btn.getAttribute('onclick');
      if (onclick && onclick.includes('_toggleCompare')) {
        const id = onclick.match(/'([^']+)'/);
        if (id && compareList.includes(id[1])) {
          btn.style.background = 'var(--primary-glow)';
          btn.style.borderColor = 'var(--primary)';
          btn.style.color = 'var(--primary)';
        }
      }
    });
  };

  // ─── Event Listeners ──────────────────────────────────────
  document.getElementById('plan-date').addEventListener('change', async () => {
    const newDate = document.getElementById('plan-date').value;
    if (newDate && cart.vendors.length > 0) {
      // Check if any vendor in cart is booked on the new date
      const conflicts = [];
      for (const v of cart.vendors) {
        const bookings = await window.db.getVendorBookings(v.id);
        if (bookings.includes(newDate)) {
          conflicts.push(v);
        }
      }
      if (conflicts.length > 0) {
        const names = conflicts.map(v => v.name).join('، ');
        const ok = await window.UI.confirm('⚠️ المزودون التالون محجوزون في التاريخ الجديد:\n\n' + names + '\n\nهل تريد إزالتهم من السلة؟');
        if (ok) {
          cart.vendors = cart.vendors.filter(v => !conflicts.find(c => c.id === v.id));
          window.UI.toast('تم إزالة ' + conflicts.length + ' مزود محجوز من السلة', 'info');
        }
      }
    }
    updateCartUI();
    loadVendors();
  });
  document.getElementById('plan-guests').addEventListener('input', () => { updateCartUI(); loadVendors(); });
  document.getElementById('plan-client').addEventListener('change', (e) => {
    const client = clients.find(c => c.id === e.target.value);
    if (client && client.expectedGuests) {
      document.getElementById('plan-guests').value = client.expectedGuests;
    }
    updateCartUI();
    loadVendors();
  });
  document.getElementById('plan-search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    loadVendors();
  });

  // Category pills
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.id;
      loadVendors();
    });
  });

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      loadVendors();
    });
  });

  // Load Draft logic
  document.getElementById('plan-load').addEventListener('change', async (e) => {
    const planId = e.target.value;
    if (!planId) return;
    const plan = plans.find(p => (p._id || p.id) === planId);
    if (plan) {
      document.getElementById('plan-name').value = plan.name || 'خطة مقترحة';
      document.getElementById('plan-date').value = plan.dateStr;
      document.getElementById('plan-guests').value = plan.guests;
      if (plan.clientId) document.getElementById('plan-client').value = plan.clientId;
      
      const vObjs = window._planVendors.filter(v => plan.vendorIds.includes(v.id));
      cart = { 
        id: plan._id || plan.id,
        clientId: plan.clientId || '', 
        date: plan.dateStr, 
        guests: plan.guests, 
        vendors: vObjs,
        name: plan.name || 'خطة مقترحة',
        bookedBy: plan.bookedBy || { name: '', phone: '', source: 'website' }
      };
      updateCartUI();
      loadVendors();
    }
  });

  document.getElementById('plan-name').addEventListener('input', (e) => cart.name = e.target.value);

  // ─── Contacts Management ──────────────────────────────────
  window._planContacts = [];

  const renderContactsList = () => {
    const container = document.getElementById('contacts-container');
    if (!container) return;
    let html = '';
    window._planContacts.forEach((c, i) => {
      html += '<div class="contact-row">' +
        '<input type="text" placeholder="الاسم" value="' + (c.name || '') + '" data-idx="' + i + '" data-field="name">' +
        '<input type="text" placeholder="رقم الجوال" value="' + (c.phone || '') + '" data-idx="' + i + '" data-field="phone" style="direction:ltr;">' +
        '<select data-idx="' + i + '" data-field="role">' +
          '<option value="العريس"' + (c.role === 'العريس' ? ' selected' : '') + '>العريس</option>' +
          '<option value="العروس"' + (c.role === 'العروس' ? ' selected' : '') + '>العروس</option>' +
          '<option value="أحد الأهل"' + (c.role === 'أحد الأهل' ? ' selected' : '') + '>أحد الأهل</option>' +
          '<option value="أخرى"' + (c.role === 'أخرى' ? ' selected' : '') + '>أخرى</option>' +
        '</select>' +
        '<button type="button" class="btn-remove-contact" data-idx="' + i + '"><i class="fa-solid fa-times"></i></button>' +
      '</div>';
    });
    container.innerHTML = html;
    // Bind events
    container.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const field = e.target.dataset.field;
        if (window._planContacts[idx]) window._planContacts[idx][field] = e.target.value;
      });
    });
    container.querySelectorAll('.btn-remove-contact').forEach(el => {
      el.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        window._planContacts.splice(idx, 1);
        renderContactsList();
      });
    });
  };

  document.getElementById('btn-add-contact').addEventListener('click', () => {
    window._planContacts.push({ name: '', phone: '', role: 'العريس' });
    renderContactsList();
  });

  // Add one empty contact by default
  if (window._planContacts.length === 0) {
    window._planContacts.push({ name: '', phone: '', role: 'العريس' });
    renderContactsList();
  }

  // ─── Build Plan Data Helper ───────────────────────────────
  const buildPlanData = (status) => {
    return {
      clientId: cart.clientId,
      dateStr: cart.date,
      vendorIds: cart.vendors.map(v => v.id),
      organizerName: currentUser.name,
      guests: cart.guests,
      name: document.getElementById('plan-name')?.value || 'خطة مقترحة',
      status: status,
      bookedBy: {
        name: document.getElementById('booker-name')?.value?.trim() || '',
        contacts: window._planContacts.filter(c => c.name || c.phone),
        source: document.getElementById('booker-source')?.value || 'website',
        notes: document.getElementById('plan-notes')?.value?.trim() || ''
      },
      eventType: document.getElementById('event-type')?.value || 'زفاف',
      eventTime: document.getElementById('event-time')?.value || 'مسائي',
      venue: document.getElementById('plan-venue')?.value?.trim() || '',
      specialRequests: document.getElementById('special-requests')?.value?.trim() || ''
    };
  };

  // Reserve button
  document.getElementById('btn-reserve').addEventListener('click', async () => {
    const validation = window.Services.Validation.validateBooking(cart);
    if (!validation.valid) {
      window.UI.toast(validation.errors[0], 'error');
      return;
    }
    const ok = await window.UI.confirm('تأكيد الحجز لتاريخ ' + cart.date + '؟<br>سيتم إرسال إشعارات لجميع المزودين وتحديث تقاويمهم.');
    if (!ok) return;

    const planData = buildPlanData('confirmed');

    let result;
    if (cart.id) {
      planData.id = cart.id;
      result = await window.db.updatePlan(planData);
    } else {
      result = await window.db.reservePlan(planData);
    }

    if (result && result.error) {
      window.UI.toast(result.error, 'error');
      return;
    }

    window.UI.toast('تم الحجز بنجاح! تم إشعار جميع المزودين', 'success');
    cart = { id: null, clientId: '', date: '', guests: 100, vendors: [], name: '' };
    window._planContacts = [];
    renderOrgPlan(document.querySelector('.main-content'));
  });

  // Draft button
  document.getElementById('btn-draft').addEventListener('click', async () => {
    const validation = window.Services.Validation.validateBooking(cart);
    if (!validation.valid) {
      window.UI.toast(validation.errors[0], 'error');
      return;
    }

    const planData = buildPlanData('draft');

    let result;
    if (cart.id) {
      planData.id = cart.id;
      result = await window.db.updatePlan(planData);
    } else {
      result = await window.db.reservePlan(planData);
    }

    if (result && result.error) {
      window.UI.toast(result.error, 'error');
      return;
    }

    window.UI.toast('تم حفظ المسودة بنجاح (بدون إشعار المزودين)', 'info');
    cart = { id: null, clientId: '', date: '', guests: 100, vendors: [], name: '' };
    window._planContacts = [];
    renderOrgPlan(document.querySelector('.main-content'));
  });

  updateCartUI();
  loadVendors();
}

// ═══════════════════════════════════════════════════════════════
// 3. ORGANIZER CLIENTS
// ═══════════════════════════════════════════════════════════════

async function renderOrgClients(container) {
  const clients = await window.db.getClients();

  let clientsHtml = '';
  if (clients.length === 0) {
    clientsHtml = window.UI.emptyState('fa-user-group', 'لا يوجد عملاء', 'ابدأ بتسجيل عميلك الأول');
  } else {
    clientsHtml = '<div class="grid">';
    clients.forEach(c => {
      clientsHtml += '<div class="card">' +
        '<div class="card-header">' +
          '<span class="card-title"><i class="fa-solid fa-user" style="color:var(--primary);"></i> ' + c.name + '</span>' +
          window.UI.statusBadge(c.status || 'active') +
        '</div>' +
        '<div class="card-body">' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-phone"></i> ' + (c.phone || '-') + '</p>' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-users"></i> ضيوف: ' + (c.expectedGuests || 'غير محدد') + '</p>' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-wallet"></i> ميزانية: ' + (c.budget ? window.Services.Pricing.formatPrice(Number(c.budget)) : 'مفتوحة') + '</p>' +
          '<p class="text-xs text-muted"><i class="fa-solid fa-clock"></i> ' + window.Services.DateUtils.formatDateTime(c.createdAt) + '</p>' +
        '</div>' +
        '<div class="card-footer" style="display:flex; gap:8px;">' +
          '<button class="btn btn-outline btn-sm" onclick="window._editClient(\'' + c.id + '\')"><i class="fa-solid fa-pen"></i> تعديل</button>' +
          '<button class="btn btn-danger btn-sm" onclick="window._deleteClient(\'' + c.id + '\')"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    });
    clientsHtml += '</div>';
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-user-group" style="color:var(--primary);"></i> إدارة العملاء</h1><p class="page-subtitle">' + clients.length + ' عميل مسجل</p></div></div>' +

      '<div class="card mb-24">' +
        '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-user-plus" style="color:var(--success);"></i> تسجيل عميل جديد</h3>' +
        '<form id="client-form">' +
          '<div class="form-row">' +
            '<div class="form-group"><label>الاسم *</label><input type="text" id="c-name" required placeholder="اسم العميل"></div>' +
            '<div class="form-group"><label>الجوال *</label><input type="text" id="c-phone" required placeholder="05xxxxxxxx"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label>عدد الضيوف المتوقع</label><input type="number" id="c-guests" value="100" min="1"></div>' +
            '<div class="form-group"><label>الميزانية القصوى (اختياري)</label><input type="number" id="c-budget" placeholder="مثل: 50000"></div>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> تسجيل العميل</button>' +
        '</form>' +
      '</div>' +
      clientsHtml +
    '</div>';

  document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('c-name').value.trim(),
      phone: document.getElementById('c-phone').value.trim(),
      expectedGuests: parseInt(document.getElementById('c-guests').value) || 100,
      budget: document.getElementById('c-budget').value || null
    };
    const validation = window.Services.Validation.validateClient(data);
    if (!validation.valid) {
      window.UI.toast(validation.errors[0], 'error');
      return;
    }
    await window.db.addClient(data);
    window.UI.toast('تم تسجيل العميل بنجاح', 'success');
    renderOrgClients(container);
  });

  window._deleteClient = async (id) => {
    const ok = await window.UI.confirm('هل تريد حذف هذا العميل نهائياً؟');
    if (ok) {
      await window.db.deleteClient(id);
      window.UI.toast('تم حذف العميل', 'info');
      renderOrgClients(container);
    }
  };

  window._editClient = async (id) => {
    const client = await window.db.getClient(id);
    if (!client) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-title"><i class="fa-solid fa-pen" style="color:var(--primary);"></i> تعديل العميل</div>' +
        '<div class="modal-body">' +
          '<div class="form-group"><label>الاسم</label><input type="text" id="edit-name" value="' + client.name + '"></div>' +
          '<div class="form-group"><label>الجوال</label><input type="text" id="edit-phone" value="' + (client.phone || '') + '"></div>' +
          '<div class="form-group"><label>الضيوف المتوقعين</label><input type="number" id="edit-guests" value="' + (client.expectedGuests || 100) + '"></div>' +
          '<div class="form-group"><label>الميزانية</label><input type="number" id="edit-budget" value="' + (client.budget || '') + '"></div>' +
          '<div class="form-group"><label>الحالة</label><select id="edit-status"><option value="active" ' + (client.status === 'active' ? 'selected' : '') + '>نشط</option><option value="booked" ' + (client.status === 'booked' ? 'selected' : '') + '>محجوز</option><option value="completed" ' + (client.status === 'completed' ? 'selected' : '') + '>مكتمل</option><option value="cancelled" ' + (client.status === 'cancelled' ? 'selected' : '') + '>ملغي</option></select></div>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" id="edit-cancel">إلغاء</button>' +
          '<button class="btn btn-primary" id="edit-save">حفظ التعديلات</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#edit-cancel').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
    overlay.querySelector('#edit-save').addEventListener('click', async () => {
      client.name = document.getElementById('edit-name').value.trim();
      client.phone = document.getElementById('edit-phone').value.trim();
      client.expectedGuests = parseInt(document.getElementById('edit-guests').value) || 100;
      client.budget = document.getElementById('edit-budget').value || null;
      client.status = document.getElementById('edit-status').value;
      await window.db.updateClient(client);
      document.body.removeChild(overlay);
      window.UI.toast('تم تحديث بيانات العميل', 'success');
      renderOrgClients(container);
    });
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. ORGANIZER VENDORS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

async function renderOrgVendors(container) {
  const vendors = await window.db.getVendors();
  const services = await window.db.getServices();

  let srvOptions = '<option value="all">جميع الخدمات</option>';
  services.forEach(s => { srvOptions += '<option value="' + s.id + '">' + s.name + '</option>'; });

  let vendorsHtml = '';
  if (vendors.length === 0) {
    vendorsHtml = window.UI.emptyState('fa-store', 'لا يوجد مزودين', 'ابدأ بإضافة مزودين للنظام');
  } else {
    vendorsHtml = '<div class="grid" id="vendors-list"></div>';
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-store" style="color:var(--primary);"></i> إدارة المزودين</h1><p class="page-subtitle">' + vendors.length + ' مزود مسجل</p></div>' +
        '<button class="btn btn-primary" id="btn-add-vendor"><i class="fa-solid fa-plus"></i> إضافة مزود</button>' +
      '</div>' +
      '<div class="search-filters mb-24">' +
        '<div class="form-group"><label>بحث</label><input type="text" id="v-search" placeholder="ابحث بالاسم..."></div>' +
        '<div class="form-group"><label>نوع الخدمة</label><select id="v-filter">' + srvOptions + '</select></div>' +
      '</div>' +
      vendorsHtml +
    '</div>';

  const renderList = (filter, query) => {
    let filtered = vendors;
    if (filter && filter !== 'all') filtered = filtered.filter(v => v.serviceId === filter);
    if (query) filtered = window.Services.Search.filterVendors(filtered, { query });

    const listEl = document.getElementById('vendors-list');
    if (!listEl) return;
    if (filtered.length === 0) {
      listEl.innerHTML = window.UI.emptyState('fa-search', 'لا توجد نتائج', '');
      return;
    }
    let html = '';
    filtered.forEach(v => {
      const srv = services.find(s => s.id === v.serviceId);
      html += '<div class="card">' +
        '<div class="card-header"><span class="card-title truncate">' + v.name + '</span>' + window.UI.badge(srv ? srv.name : '-', 'gold') + '</div>' +
        '<div class="card-body">' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-envelope"></i> ' + v.email + '</p>' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-phone"></i> ' + v.phone + '</p>' +
          '<p class="text-sm mb-8"><i class="fa-solid fa-tag"></i> ' + window.Services.Pricing.getPriceLabel(v) + '</p>' +
          (v.maxCapacity ? '<p class="text-sm mb-8"><i class="fa-solid fa-users"></i> سعة: ' + v.maxCapacity + '</p>' : '') +
          '<div>' + window.UI.starsHTML(v.rating) + '</div>' +
        '</div>' +
        '<div class="card-footer" style="display:flex;gap:8px;">' +
          '<button class="btn btn-outline btn-sm" onclick="window._viewVendorReviews(\'' + v.id + '\')"><i class="fa-solid fa-star"></i> التقييمات</button>' +
          '<button class="btn btn-outline btn-sm" onclick="window._viewVendorCalendar(\'' + v.id + '\', \'' + v.name + '\')"><i class="fa-solid fa-calendar-days"></i> التقويم</button>' +
          '<button class="btn btn-danger btn-sm" onclick="window._deleteVendor(\'' + v.id + '\')"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    });
    listEl.innerHTML = html;
  };

  renderList('all', '');

  document.getElementById('v-search').addEventListener('input', (e) => {
    renderList(document.getElementById('v-filter').value, e.target.value);
  });
  document.getElementById('v-filter').addEventListener('change', (e) => {
    renderList(e.target.value, document.getElementById('v-search').value);
  });

  document.getElementById('btn-add-vendor').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    let srvOpts = '';
    services.forEach(s => { srvOpts += '<option value="' + s.id + '">' + s.name + '</option>'; });
    overlay.innerHTML =
      '<div class="modal-box" style="max-width:600px;">' +
        '<div class="modal-title"><i class="fa-solid fa-store" style="color:var(--primary);"></i> إضافة مزود جديد</div>' +
        '<div class="modal-body">' +
          '<div class="form-row"><div class="form-group"><label>الاسم *</label><input type="text" id="nv-name" required></div><div class="form-group"><label>البريد *</label><input type="email" id="nv-email" required></div></div>' +
          '<div class="form-row"><div class="form-group"><label>كلمة المرور *</label><input type="text" id="nv-pass" value="123"></div><div class="form-group"><label>الجوال</label><input type="text" id="nv-phone"></div></div>' +
          '<div class="form-row"><div class="form-group"><label>الخدمة *</label><select id="nv-service">' + srvOpts + '</select></div><div class="form-group"><label>السعر *</label><input type="number" id="nv-price" min="1"></div></div>' +
          '<div class="form-row"><div class="form-group"><label>نوع التسعير</label><select id="nv-pricing"><option value="flat">مقطوع</option><option value="perPerson">للشخص</option></select></div><div class="form-group"><label>السعة القصوى</label><input type="number" id="nv-cap" placeholder="اختياري"></div></div>' +
          '<div class="form-group"><label>الوصف</label><textarea id="nv-desc" rows="2"></textarea></div>' +
        '</div>' +
        '<div class="modal-actions"><button class="btn btn-outline" id="nv-cancel">إلغاء</button><button class="btn btn-primary" id="nv-save">إضافة المزود</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#nv-cancel').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
    overlay.querySelector('#nv-save').addEventListener('click', async () => {
      const data = {
        name: document.getElementById('nv-name').value.trim(),
        email: document.getElementById('nv-email').value.trim(),
        password: document.getElementById('nv-pass').value,
        phone: document.getElementById('nv-phone').value.trim(),
        serviceId: document.getElementById('nv-service').value,
        price: parseInt(document.getElementById('nv-price').value),
        pricingType: document.getElementById('nv-pricing').value,
        maxCapacity: parseInt(document.getElementById('nv-cap').value) || null,
        description: document.getElementById('nv-desc').value.trim()
      };
      const v = window.Services.Validation.validateVendor(data);
      if (!v.valid) { window.UI.toast(v.errors[0], 'error'); return; }
      await window.db.addVendor(data);
      document.body.removeChild(overlay);
      window.UI.toast('تم إضافة المزود بنجاح', 'success');
      renderOrgVendors(container);
    });
  });

  window._deleteVendor = async (id) => {
    const ok = await window.UI.confirm('هل تريد حذف هذا المزود نهائياً؟');
    if (ok) {
      await window.db.deleteVendor(id);
      window.UI.toast('تم حذف المزود', 'info');
      renderOrgVendors(container);
    }
  };

  window._viewVendorReviews = async (vendorId) => {
    const reviews = await window.db.getVendorReviews(vendorId);
    const vendor = await window.db.getVendor(vendorId);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    let reviewsHtml = reviews.length === 0 ? '<p class="text-muted">لا توجد تقييمات بعد</p>' : reviews.map(r => window.UI.reviewCard(r)).join('');

    overlay.innerHTML =
      '<div class="modal-box" style="max-width:600px; max-height:80vh; overflow-y:auto;">' +
        '<div class="modal-title"><i class="fa-solid fa-star" style="color:var(--primary);"></i> تقييمات ' + (vendor ? vendor.name : '') + '</div>' +
        '<div class="modal-body">' +
          '<div style="margin-bottom:16px;">' + window.UI.starsHTML(vendor ? vendor.rating : 0) + ' <span class="text-sm text-muted">(' + reviews.length + ' تقييم)</span></div>' +
          reviewsHtml +
          '<div class="divider"></div>' +
          '<h4 style="margin-bottom:12px;">إضافة تقييم</h4>' +
          '<div class="form-group"><label>اسم المقيّم</label><input type="text" id="rev-name"></div>' +
          window.UI.interactiveStarsHTML(0, 'rev-rating') + '<input type="hidden" name="rev-rating" value="0">' +
          '<div class="form-group mt-16"><label>التعليق</label><textarea id="rev-comment" rows="2"></textarea></div>' +
          '<button class="btn btn-primary btn-sm" id="rev-submit"><i class="fa-solid fa-paper-plane"></i> إرسال التقييم</button>' +
        '</div>' +
        '<div class="modal-actions"><button class="btn btn-outline" id="rev-close">إغلاق</button></div>' +
      '</div>';
    document.body.appendChild(overlay);
    window.UI.bindStarRatings(overlay);
    overlay.querySelector('#rev-close').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
    overlay.querySelector('#rev-submit').addEventListener('click', async () => {
      const name = document.getElementById('rev-name').value.trim() || 'مجهول';
      const rating = parseInt(overlay.querySelector('[name="rev-rating"]').value) || 0;
      const comment = document.getElementById('rev-comment').value.trim();
      if (rating === 0) { window.UI.toast('يرجى اختيار التقييم', 'error'); return; }
      await window.db.addReview(vendorId, name, rating, comment);
      window.UI.toast('تم إضافة التقييم', 'success');
      document.body.removeChild(overlay);
      renderOrgVendors(container);
    });
  };

  window._viewVendorCalendar = async (vendorId, vendorName) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

    let monthOpts = '';
    months.forEach((m, i) => { monthOpts += '<option value="' + i + '">' + m + '</option>'; });
    let yearOpts = '';
    for (let y = currentYear - 2; y <= currentYear + 3; y++) {
      yearOpts += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
    }

    overlay.innerHTML =
      '<div class="modal-box" style="max-width:650px; max-height:90vh; overflow-y:auto;">' +
        '<div class="modal-title"><i class="fa-solid fa-calendar-days" style="color:var(--primary);"></i> تقويم ' + vendorName + '</div>' +
        '<div class="modal-body">' +
          '<div class="card" style="padding:16px;">' +
            '<div class="calendar-header" style="display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px;">' +
              '<div style="display:flex; align-items:center; gap:4px;">' +
                '<button class="btn btn-outline btn-sm" id="admin-cal-prev-month"><i class="fa-solid fa-chevron-right"></i></button>' +
                '<select id="admin-cal-month" style="padding:4px 8px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); font-weight:700;">' + monthOpts + '</select>' +
                '<button class="btn btn-outline btn-sm" id="admin-cal-next-month"><i class="fa-solid fa-chevron-left"></i></button>' +
              '</div>' +
              '<div style="display:flex; align-items:center; gap:4px;">' +
                '<button class="btn btn-outline btn-sm" id="admin-cal-prev-year"><i class="fa-solid fa-forward"></i></button>' +
                '<select id="admin-cal-year" style="padding:4px 8px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); font-weight:700; font-family:Inter,sans-serif;">' + yearOpts + '</select>' +
                '<button class="btn btn-outline btn-sm" id="admin-cal-next-year"><i class="fa-solid fa-backward"></i></button>' +
              '</div>' +
              '<button class="btn-today" id="admin-cal-today" style="font-size:0.85rem;">📅 اليوم</button>' +
            '</div>' +
            '<div id="admin-cal-grid"></div>' +
            '<div id="admin-cal-summary" style="display:flex; gap:20px; justify-content:center; margin-top:12px; font-size:0.9rem;"></div>' +
            '<div style="margin-top:12px; display:flex; gap:20px; justify-content:center; font-size:0.85rem;">' +
              '<span style="display:flex; align-items:center; gap:6px;"><span style="width:14px;height:14px;border-radius:50%;background:var(--success);display:inline-block;"></span> متاح</span>' +
              '<span style="display:flex; align-items:center; gap:6px;"><span style="width:14px;height:14px;border-radius:50%;background:var(--danger);display:inline-block;"></span> محجوز</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-actions"><button class="btn btn-outline" id="cal-close">إغلاق</button></div>' +
      '</div>';
    
    document.body.appendChild(overlay);
    overlay.querySelector('#cal-close').addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });

    const monthSelect = overlay.querySelector('#admin-cal-month');
    const yearSelect = overlay.querySelector('#admin-cal-year');
    monthSelect.value = currentMonth;

    const drawCalendar = async () => {
      monthSelect.value = currentMonth;
      yearSelect.value = currentYear;

      const bookings = await window.db.getVendorBookings(vendorId);
      const grid = document.getElementById('admin-cal-grid');
      const summary = document.getElementById('admin-cal-summary');

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const today = new Date().toISOString().slice(0, 10);
      const dayNames = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

      let html = '<div class="calendar-grid" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center;">';
      dayNames.forEach(d => { html += '<div class="calendar-day-header" style="font-weight:bold; padding:8px 0;">' + d + '</div>'; });

      for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty" style="padding:16px;"></div>';
      }

      let bookedCount = 0, freeCount = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const isBooked = bookings.includes(dateStr);
        const isToday = dateStr === today;
        let bg = isBooked ? 'var(--danger-light)' : 'var(--success-light)';
        let color = isBooked ? 'var(--danger)' : 'var(--success)';
        let border = isToday ? '2px solid var(--primary)' : '1px solid #eee';
        if (isBooked) bookedCount++; else freeCount++;

        html += '<div class="calendar-day" style="background:'+bg+'; color:'+color+'; border:'+border+'; padding:16px 4px; border-radius:8px; cursor:default; display:flex; flex-direction:column; align-items:center;">' +
          '<span style="font-size:1.1rem; font-weight:800;">' + d + '</span>' +
          '<span class="day-label" style="font-size:0.75rem;">' + (isBooked ? 'محجوز' : 'متاح') + '</span>' +
        '</div>';
      }

      grid.innerHTML = html + '</div>';
      summary.innerHTML =
        '<span><i class="fa-solid fa-calendar-check" style="color:var(--success);"></i> ' + freeCount + ' متاح</span>' +
        '<span><i class="fa-solid fa-calendar-xmark" style="color:var(--danger);"></i> ' + bookedCount + ' محجوز</span>' +
        '<span><i class="fa-solid fa-calendar" style="color:var(--text-muted);"></i> ' + daysInMonth + ' إجمالي</span>';
    };

    overlay.querySelector('#admin-cal-prev-month').addEventListener('click', () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } drawCalendar(); });
    overlay.querySelector('#admin-cal-next-month').addEventListener('click', () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } drawCalendar(); });
    overlay.querySelector('#admin-cal-prev-year').addEventListener('click', () => { currentYear++; drawCalendar(); });
    overlay.querySelector('#admin-cal-next-year').addEventListener('click', () => { currentYear--; drawCalendar(); });
    monthSelect.addEventListener('change', () => { currentMonth = parseInt(monthSelect.value); drawCalendar(); });
    yearSelect.addEventListener('change', () => { currentYear = parseInt(yearSelect.value); drawCalendar(); });
    overlay.querySelector('#admin-cal-today').addEventListener('click', () => { currentMonth = new Date().getMonth(); currentYear = new Date().getFullYear(); drawCalendar(); });

    drawCalendar();
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. ORGANIZER RESERVATIONS
// ═══════════════════════════════════════════════════════════════

async function renderOrgReservations(container) {
  const plans = await window.db.getPlans();
  const services = await window.db.getServices();
  const sorted = plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let tableRows = '';
  if (sorted.length === 0) {
    tableRows = '<tr><td colspan="8" style="text-align:center; padding:40px;">' + window.UI.emptyState('fa-calendar-check', 'لا توجد حجوزات', 'ابدأ ببناء خطة زفاف وحجزها') + '</td></tr>';
  } else {
    for (const p of sorted) {
      const vendorCount = p.vendorIds ? p.vendorIds.length : 0;
      const booker = p.bookedBy?.name ? p.bookedBy.name + (p.bookedBy.source === 'website' ? ' (موقع)' : (p.bookedBy.source === 'organizer' ? ' (منظم)' : ' (خارجي)')) : '-';
      tableRows += '<tr>' +
        '<td><strong>' + p.id.slice(-6) + '</strong></td>' +
        '<td>' + (p.clientName || '-') + '</td>' +
        '<td>' + (p.dateStr || '-') + '</td>' +
        '<td>' + (p.guests || '-') + ' شخص</td>' +
        '<td>' + vendorCount + ' خدمة</td>' +
        '<td>' + window.Services.Pricing.formatPrice(p.totalCost || 0) + '</td>' +
        '<td>' + booker + '</td>' +
        '<td style="display:flex; gap:6px; align-items:center;">' +
          window.UI.statusBadge(p.status || 'confirmed') +
          '<button class="btn btn-outline btn-sm" onclick="window._printPlan(\'' + p.id + '\')"><i class="fa-solid fa-print"></i></button>' +
          '<button class="btn btn-danger btn-sm" onclick="window._cancelPlan(\'' + p.id + '\')"><i class="fa-solid fa-ban"></i></button>' +
        '</td>' +
      '</tr>';
    }
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-calendar-check" style="color:var(--primary);"></i> الحجوزات</h1><p class="page-subtitle">' + plans.length + ' حجز</p></div></div>' +
      '<div class="card" style="overflow-x:auto;">' +
        '<table class="data-table">' +
          '<thead><tr><th>رقم</th><th>العميل</th><th>التاريخ</th><th>الحضور</th><th>الخدمات</th><th>التكلفة</th><th>مصدر الحجز</th><th>الحالة</th></tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

  window._printPlan = async (planId) => {
    await window.Services.Export.printPlan(planId);
  };

  window._cancelPlan = async (planId) => {
    const ok = await window.UI.confirm('هل تريد إلغاء هذا الحجز؟');
    if (ok) {
      const plan = await window.db.getPlan(planId);
      if (plan) {
        plan.status = 'cancelled';
        await window.db.updatePlan(plan);
        await window.db.logActivity('plan', 'تم إلغاء حجز');
        window.UI.toast('تم إلغاء الحجز', 'info');
        renderOrgReservations(container);
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// 6. ORGANIZER REPORTS
// ═══════════════════════════════════════════════════════════════

async function renderOrgReports(container) {
  const stats = await window.Services.Statistics.getDashboardStats();
  const breakdown = await window.Services.Statistics.getServiceBreakdown();
  const monthly = await window.Services.Statistics.getMonthlyBookings();
  const topVendors = await window.Services.Statistics.getTopVendors(5);

  // Service breakdown table
  let breakdownRows = '';
  breakdown.forEach(b => {
    breakdownRows += '<tr>' +
      '<td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + b.service.color + ';margin-left:8px;"></span>' + b.service.name + '</td>' +
      '<td>' + b.vendorCount + '</td>' +
      '<td>' + b.bookingCount + '</td>' +
      '<td>' + window.Services.Pricing.formatPrice(b.avgPrice) + '</td>' +
    '</tr>';
  });

  // Top vendors list
  let topHtml = '';
  topVendors.forEach((v, i) => {
    topHtml += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-light);">' +
      '<span style="font-size:1.2rem;font-weight:800;color:var(--primary);width:30px;">#' + (i + 1) + '</span>' +
      '<div style="flex:1;"><div style="font-weight:700;">' + v.name + '</div><div class="text-xs text-muted">' + v.bookings + ' حجز | ' + window.UI.starsHTML(v.rating) + '</div></div>' +
    '</div>';
  });

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-chart-bar" style="color:var(--primary);"></i> التقارير والإحصائيات</h1></div></div>' +

      '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom:24px;">' +
        '<div class="card"><h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-chart-column"></i> الحجوزات الشهرية</h3>' +
          (monthly.length > 0 ? window.UI.barChart(monthly.map(m => ({ label: m.month, value: m.count })), { height: 180 }) : '<p class="text-muted text-center">لا توجد بيانات</p>') +
        '</div>' +
        '<div class="card"><h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-trophy"></i> أفضل المزودين</h3>' +
          (topHtml || '<p class="text-muted text-center">لا توجد بيانات</p>') +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-layer-group"></i> تفصيل الخدمات</h3>' +
        '<div style="overflow-x:auto;">' +
          '<table class="data-table">' +
            '<thead><tr><th>الخدمة</th><th>عدد المزودين</th><th>عدد الحجوزات</th><th>متوسط السعر</th></tr></thead>' +
            '<tbody>' + breakdownRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
// 7. ORGANIZER CHECKLIST
// ═══════════════════════════════════════════════════════════════

async function renderOrgChecklist(container) {
  const items = await window.db.getChecklist('template');
  const progress = window.Services.Checklist.getProgress(items);
  const grouped = window.Services.Checklist.groupByCategory(items);

  let checklistHtml = '';
  for (const cat in grouped) {
    checklistHtml += '<div class="checklist-category"><i class="fa-solid ' + window.Services.Checklist.getCategoryIcon(cat) + '"></i> ' + window.Services.Checklist.getCategoryLabel(cat) + '</div>';
    grouped[cat].forEach(item => {
      checklistHtml += window.UI.checklistItem(item);
    });
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-list-check" style="color:var(--primary);"></i> قائمة مهام الزفاف</h1><p class="page-subtitle">تتبع تقدم التحضيرات</p></div></div>' +

      '<div class="card mb-24">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">' +
          '<span style="font-weight:700;">التقدم العام</span>' +
          '<span style="font-weight:800; color:var(--primary);">' + progress.completed + ' / ' + progress.total + '</span>' +
        '</div>' +
        window.UI.progressBar(progress.percentage, progress.percentage === 100 ? 'green' : progress.percentage > 60 ? 'yellow' : '') +
      '</div>' +

      '<div class="card mb-24">' +
        '<form id="add-task-form" style="display:flex; gap:12px; align-items:flex-end;">' +
          '<div class="form-group" style="flex:1;margin:0;"><label>إضافة مهمة جديدة</label><input type="text" id="new-task" placeholder="اكتب المهمة..."></div>' +
          '<div class="form-group" style="margin:0;"><label>الفترة</label><select id="new-task-cat"><option value="6months">قبل 6 أشهر</option><option value="3months">قبل 3 أشهر</option><option value="1month">قبل شهر</option><option value="1week">قبل أسبوع</option><option value="dayof">يوم الزفاف</option></select></div>' +
          '<button type="submit" class="btn btn-primary" style="margin-bottom:0;"><i class="fa-solid fa-plus"></i></button>' +
        '</form>' +
      '</div>' +

      '<div id="checklist-container">' + checklistHtml + '</div>' +
    '</div>';

  // Toggle checklist items
  container.querySelectorAll('.checklist-item').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id;
      const item = items.find(i => i.id === id);
      if (item) {
        item.done = !item.done;
        await window.db.updateChecklistItem(item);
        renderOrgChecklist(container);
      }
    });
  });

  // Add new task
  document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('new-task').value.trim();
    if (!text) return;
    await window.db.addChecklistItem({
      text,
      category: document.getElementById('new-task-cat').value,
      planId: 'template',
      order: items.length + 1
    });
    window.UI.toast('تمت إضافة المهمة', 'success');
    renderOrgChecklist(container);
  });
}

// ═══════════════════════════════════════════════════════════════
// 8. ORGANIZER SETTINGS
// ═══════════════════════════════════════════════════════════════

function renderOrgSettings(container) {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-gear" style="color:var(--primary);"></i> الإعدادات</h1></div></div>' +

      '<div class="card mb-24">' +
        '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-palette"></i> المظهر</h3>' +
        '<div style="display:flex; gap:16px;">' +
          '<button class="btn ' + (currentTheme === 'light' ? 'btn-primary' : 'btn-outline') + '" id="set-light"><i class="fa-solid fa-sun"></i> فاتح</button>' +
          '<button class="btn ' + (currentTheme === 'dark' ? 'btn-primary' : 'btn-outline') + '" id="set-dark"><i class="fa-solid fa-moon"></i> داكن</button>' +
        '</div>' +
      '</div>' +

      '<div class="card mb-24">' +
        '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-database"></i> قاعدة البيانات</h3>' +
        '<p class="text-sm text-muted mb-16">قاعدة البيانات تعمل على MongoDB Atlas (سحابي). إعادة التعيين ستحذف جميع البيانات وتعيد البيانات التجريبية.</p>' +
        '<div style="display:flex; align-items:center; gap:8px; padding:12px; background:var(--success-light); border-radius:var(--radius-sm); margin-bottom:16px;">' +
          '<i class="fa-solid fa-circle-check" style="color:var(--success);"></i>' +
          '<span class="text-sm" style="font-weight:600;">قاعدة البيانات متصلة وتعمل بكفاءة</span>' +
        '</div>' +
        '<button class="btn btn-danger" id="btn-reset-db"><i class="fa-solid fa-rotate-left"></i> إعادة تعيين قاعدة البيانات (بيانات تجريبية)</button>' +
      '</div>' +

      '<div class="card mb-24">' +
        '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-circle-info"></i> حول النظام</h3>' +
        '<p class="text-sm mb-8"><strong>الإصدار:</strong> 4.0 (Enhanced)</p>' +
        '<p class="text-sm mb-8"><strong>البنية:</strong> API Client → Business Logic → Presentation</p>' +
        '<p class="text-sm mb-8"><strong>قاعدة البيانات:</strong> MongoDB Atlas (سحابي)</p>' +
        '<p class="text-sm mb-8"><strong>الاستضافة:</strong> Vercel (Serverless)</p>' +
        '<p class="text-sm"><strong>الخطوط:</strong> Cairo + Inter (Google Fonts)</p>' +
      '</div>' +
    '</div>';

  document.getElementById('set-light').addEventListener('click', () => {
    document.body.className = 'light-mode';
    localStorage.setItem('theme', 'light-mode');
    renderOrgSettings(container);
  });
  document.getElementById('set-dark').addEventListener('click', () => {
    document.body.className = 'dark-mode';
    localStorage.setItem('theme', 'dark-mode');
    renderOrgSettings(container);
  });
  document.getElementById('btn-reset-db').addEventListener('click', async () => {
    const ok = await window.UI.confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع البيانات وإعادة زرع بيانات تجريبية!');
    if (!ok) return;
    try {
      const btn = document.getElementById('btn-reset-db');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إعادة التعيين...';
      const resp = await fetch('/api/auth/reset-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin', password: 'admin' })
      });
      const data = await resp.json();
      if (data.error) { window.UI.toast(data.error, 'error'); btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> إعادة تعيين'; return; }
      window.UI.toast('تم إعادة التعيين بنجاح! جاري إعادة التحميل...', 'success');
      localStorage.removeItem('token');
      setTimeout(() => location.reload(), 2000);
    } catch (err) {
      window.UI.toast('حدث خطأ أثناء إعادة التعيين', 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// VENDOR LAYOUT
// ═══════════════════════════════════════════════════════════════

async function renderVendorLayout() {
  const notifs = await window.db.getVendorNotifications(currentUser.id);
  const unreadCount = notifs.filter(n => !n.read).length;
  const badgeHtml = unreadCount > 0 ? '<span class="notif-badge">' + unreadCount + '</span>' : '';
  const srv = (await window.db.getServices()).find(s => s.id === currentUser.serviceId);

  app.innerHTML =
    '<div class="dashboard">' +
      '<div class="sidebar">' +
        '<div class="sidebar-header"><i class="fa-solid fa-store"></i><span>المزود</span></div>' +
        '<div class="sidebar-subtitle">' + (srv ? srv.name : '') + '</div>' +

        '<div class="sidebar-section">الرئيسية</div>' +
        '<a class="nav-link active" id="nav-vdash"><i class="fa-solid fa-chart-pie"></i><span>لوحة المعلومات</span></a>' +
        '<a class="nav-link" id="nav-inbox"><i class="fa-solid fa-bell"></i><span>الإشعارات</span>' + badgeHtml + '</a>' +

        '<div class="sidebar-section">الإدارة</div>' +
        '<a class="nav-link" id="nav-calendar"><i class="fa-solid fa-calendar-days"></i><span>التقويم</span></a>' +
        '<a class="nav-link" id="nav-portfolio"><i class="fa-solid fa-images"></i><span>المعرض</span></a>' +
        '<a class="nav-link" id="nav-reviews"><i class="fa-solid fa-star"></i><span>التقييمات</span></a>' +
        '<a class="nav-link" id="nav-profile"><i class="fa-solid fa-id-card"></i><span>الملف الشخصي</span></a>' +

        '<div class="sidebar-footer">' +
          '<button class="btn btn-ghost w-full" id="btn-theme"><i class="fa-solid fa-moon"></i><span>تغيير المظهر</span></button>' +
          '<button class="btn btn-danger btn-sm w-full" id="btn-logout"><i class="fa-solid fa-right-from-bracket"></i><span>خروج</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="main-content" id="main-content"></div>' +
    '</div>';

  document.getElementById('btn-logout').addEventListener('click', () => { window.db.logout(); currentUser = null; render(); });
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  const navIds = ['nav-vdash', 'nav-inbox', 'nav-calendar', 'nav-portfolio', 'nav-reviews', 'nav-profile'];
  const content = document.getElementById('main-content');

  const switchTab = (tabId) => {
    navIds.forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    content.innerHTML = window.UI.loading();

    switch (tabId) {
      case 'nav-vdash':     renderVendorDashboard(content); break;
      case 'nav-inbox':     renderVendorInbox(content); break;
      case 'nav-calendar':  renderVendorCalendar(content); break;
      case 'nav-portfolio': renderVendorPortfolio(content); break;
      case 'nav-reviews':   renderVendorReviews(content); break;
      case 'nav-profile':   renderVendorProfile(content); break;
    }
  };

  navIds.forEach(id => document.getElementById(id).addEventListener('click', () => switchTab(id)));
  switchTab('nav-vdash');
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 1. DASHBOARD
// ═══════════════════════════════════════════════════════════════

async function renderVendorDashboard(container) {
  const bookings = await window.db.getVendorBookings(currentUser.id);
  const reviews = await window.db.getVendorReviews(currentUser.id);
  const notifs = await window.db.getVendorNotifications(currentUser.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingBookings = bookings.filter(d => d >= today);

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title">مرحباً، ' + currentUser.name + '</h1><p class="page-subtitle">نظرة عامة على نشاطك</p></div></div>' +

      '<div class="stats-grid">' +
        window.UI.statWidget('fa-calendar-check', 'الحجوزات القادمة', upcomingBookings.length, 'rgba(59,130,246,0.15)', 'var(--info)') +
        window.UI.statWidget('fa-calendar', 'إجمالي الحجوزات', bookings.length, 'rgba(201,162,39,0.15)', 'var(--primary)') +
        window.UI.statWidget('fa-star', 'التقييم', currentUser.rating + '/5', 'rgba(245,158,11,0.15)', 'var(--warning)') +
        window.UI.statWidget('fa-comments', 'التقييمات', reviews.length, 'rgba(16,185,129,0.15)', 'var(--success)') +
      '</div>' +

      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">' +
        '<div class="card">' +
          '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-calendar-days"></i> أقرب المواعيد</h3>' +
          (upcomingBookings.length > 0
            ? upcomingBookings.slice(0, 5).map(d => '<div style="padding:10px 0; border-bottom:1px solid var(--border-light); display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-circle" style="font-size:0.5rem; color:var(--success);"></i><span>' + window.Services.DateUtils.formatDate(d) + '</span></div>').join('')
            : window.UI.emptyState('fa-calendar', 'لا توجد مواعيد قادمة', '')) +
        '</div>' +
        '<div class="card">' +
          '<h3 style="margin-bottom:16px; font-weight:800;"><i class="fa-solid fa-bell"></i> آخر الإشعارات</h3>' +
          (notifs.length > 0
            ? notifs.slice(0, 3).map(n => '<div style="padding:10px 0; border-bottom:1px solid var(--border-light);"><div class="text-sm" style="font-weight:700;">' + n.message + '</div><div class="text-xs text-muted">' + window.Services.DateUtils.timeAgo(n.date) + '</div></div>').join('')
            : window.UI.emptyState('fa-bell', 'لا توجد إشعارات', '')) +
        '</div>' +
      '</div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 2. INBOX
// ═══════════════════════════════════════════════════════════════

async function renderVendorInbox(container) {
  const notifs = await window.db.getVendorNotifications(currentUser.id);

  let notifsHtml = '';
  if (notifs.length === 0) {
    notifsHtml = window.UI.emptyState('fa-bell-slash', 'لا توجد إشعارات', 'ستظهر هنا الحجوزات الجديدة');
  } else {
    notifsHtml = notifs.map(n => window.UI.notifCard(n)).join('');
  }

  const unread = notifs.filter(n => !n.read).length;

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-bell" style="color:var(--primary);"></i> صندوق الوارد</h1><p class="page-subtitle">' + unread + ' غير مقروء</p></div>' +
        (unread > 0 ? '<button class="btn btn-outline" id="mark-all-read"><i class="fa-solid fa-check-double"></i> تحديد الكل كمقروء</button>' : '') +
      '</div>' +
      '<div style="max-width:700px;">' + notifsHtml + '</div>' +
    '</div>';

  // Mark individual as read
  container.querySelectorAll('.notif-card').forEach(el => {
    el.addEventListener('click', async () => {
      const nid = el.dataset.id;
      const notif = notifs.find(n => n.id === nid);
      if (notif) notif.read = true;
      await window.db.markNotificationRead(nid);
      el.classList.add('read');
      // Update unread badge
      const remaining = notifs.filter(n => !n.read).length;
      const badge = document.querySelector('#nav-inbox .notif-badge');
      if (badge) {
        if (remaining > 0) { badge.textContent = remaining; }
        else { badge.remove(); }
      }
    });
  });

  // Mark all read
  const markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      await window.db.markAllNotificationsRead(currentUser.id);
      notifs.forEach(n => n.read = true);
      window.UI.toast('تم تحديد الكل كمقروء', 'success');
      const badge = document.querySelector('#nav-inbox .notif-badge');
      if (badge) badge.remove();
      container.querySelectorAll('.notif-card').forEach(el => el.classList.add('read'));
      markAllBtn.remove();
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 3. CALENDAR
// ═══════════════════════════════════════════════════════════════

async function renderVendorCalendar(container) {
  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  // Build month options
  let monthOpts = '';
  months.forEach((m, i) => { monthOpts += '<option value="' + i + '">' + m + '</option>'; });

  // Build year options (current -2 to +3)
  let yearOpts = '';
  for (let y = currentYear - 2; y <= currentYear + 3; y++) {
    yearOpts += '<option value="' + y + '"' + (y === currentYear ? ' selected' : '') + '>' + y + '</option>';
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-calendar-days" style="color:var(--primary);"></i> التقويم</h1><p class="page-subtitle">انقر على أي يوم لتبديل حالته (متاح / محجوز)</p></div></div>' +
      '<div class="card" style="padding:24px;">' +
        '<div class="calendar-header" style="flex-wrap:wrap; gap:12px;">' +
          '<div class="calendar-nav">' +
            '<button class="btn btn-outline btn-sm" id="cal-prev-month" title="الشهر التالي"><i class="fa-solid fa-chevron-right"></i></button>' +
            '<select id="cal-month-select" style="padding:6px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); font-weight:700; font-size:0.9rem;">' + monthOpts + '</select>' +
            '<button class="btn btn-outline btn-sm" id="cal-next-month" title="الشهر السابق"><i class="fa-solid fa-chevron-left"></i></button>' +
          '</div>' +
          '<div class="calendar-nav">' +
            '<button class="btn btn-outline btn-sm" id="cal-prev-year" title="السنة التالية"><i class="fa-solid fa-forward"></i></button>' +
            '<select id="cal-year-select" style="padding:6px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); font-weight:700; font-size:0.9rem; font-family:Inter,sans-serif;">' + yearOpts + '</select>' +
            '<button class="btn btn-outline btn-sm" id="cal-next-year" title="السنة السابقة"><i class="fa-solid fa-backward"></i></button>' +
          '</div>' +
          '<button class="btn-today" id="cal-today">📅 اليوم</button>' +
        '</div>' +
        '<div id="cal-grid"></div>' +
        '<div id="cal-summary" class="calendar-month-summary"></div>' +
        '<div class="calendar-legend">' +
          '<span class="legend-item"><span class="legend-dot" style="background:var(--success);"></span> متاح</span>' +
          '<span class="legend-item"><span class="legend-dot" style="background:var(--danger);"></span> محجوز</span>' +
          '<span class="legend-item"><span class="legend-dot" style="background:var(--primary);border:2px solid var(--primary);width:10px;height:10px;"></span> اليوم</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  const monthSelect = document.getElementById('cal-month-select');
  const yearSelect = document.getElementById('cal-year-select');
  monthSelect.value = currentMonth;

  const drawCalendar = async () => {
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;

    const bookings = await window.db.getVendorBookings(currentUser.id);
    const grid = document.getElementById('cal-grid');
    const summary = document.getElementById('cal-summary');

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date().toISOString().slice(0, 10);
    const dayNames = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

    let html = '<div class="calendar-grid">';
    dayNames.forEach(d => { html += '<div class="calendar-day-header">' + d + '</div>'; });

    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    let bookedCount = 0, freeCount = 0;
    const vendorMeta = JSON.parse(localStorage.getItem('vendor_bookings_meta') || '{}');

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const isBooked = bookings.includes(dateStr);
      const isToday = dateStr === today;
      let cls = isBooked ? 'booked' : 'free';
      if (isToday) cls += ' today';
      if (isBooked) bookedCount++; else freeCount++;

      // Show client name if vendor saved one
      const meta = vendorMeta[dateStr];
      let labelText = isBooked ? 'محجوز' : 'متاح';
      if (isBooked && meta && meta.name) {
        labelText = meta.name;
      }

      html += '<div class="calendar-day ' + cls + '" data-date="' + dateStr + '"' +
        (meta && meta.name ? ' title="' + meta.name + (meta.phone ? ' — ' + meta.phone : '') + '"' : '') + '>' +
        '<span style="font-size:1.1rem; font-weight:800;">' + d + '</span>' +
        '<span class="day-label" style="font-size:0.7rem; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + labelText + '</span>' +
      '</div>';
    }

    grid.innerHTML = html + '</div>';

    summary.innerHTML =
      '<span class="summary-item"><i class="fa-solid fa-calendar-check" style="color:var(--success);"></i> ' + freeCount + ' متاح</span>' +
      '<span class="summary-item"><i class="fa-solid fa-calendar-xmark" style="color:var(--danger);"></i> ' + bookedCount + ' محجوز</span>' +
      '<span class="summary-item"><i class="fa-solid fa-calendar" style="color:var(--text-muted);"></i> ' + daysInMonth + ' إجمالي</span>';

    grid.querySelectorAll('.calendar-day:not(.empty)').forEach(el => {
      el.addEventListener('click', async () => {
        const dateStr = el.dataset.date;
        const isBooked = el.classList.contains('booked');

        if (isBooked) {
          // Unblocking — confirm first, show existing info if any
          const vendorMeta2 = JSON.parse(localStorage.getItem('vendor_bookings_meta') || '{}');
          const existing = vendorMeta2[dateStr];
          let confirmMsg = 'هل تريد إلغاء حظر تاريخ ' + dateStr + '؟';
          if (existing && existing.name) {
            confirmMsg = 'هل تريد إلغاء حجز ' + existing.name + ' بتاريخ ' + dateStr + '؟';
          }
          const ok = await window.UI.confirm(confirmMsg);
          if (!ok) return;
          const result = await window.db.toggleVendorBooking(currentUser.id, dateStr);
          if (result && result.error) {
            window.UI.toast(result.error, 'error');
            return;
          }
          // Cleanup saved metadata
          if (vendorMeta2[dateStr]) {
            delete vendorMeta2[dateStr];
            localStorage.setItem('vendor_bookings_meta', JSON.stringify(vendorMeta2));
          }
          window.UI.toast('تم إلغاء الحظر', 'info');
          drawCalendar();
        } else {
          // Blocking — show form to add optional client info
          const popup = document.createElement('div');
          popup.className = 'modal-overlay';
          popup.innerHTML =
            '<div class="modal-box" style="max-width:420px;">' +
              '<div class="modal-title"><i class="fa-solid fa-calendar-plus" style="color:var(--primary);"></i> حجز تاريخ ' + dateStr + '</div>' +
              '<div class="modal-body">' +
                '<p class="text-sm text-muted mb-16">يمكنك إضافة بيانات العميل (اختياري). هذه البيانات تظهر لك فقط.</p>' +
                '<div class="form-group"><label>اسم العميل</label><input type="text" id="vb-name" placeholder="مثال: أحمد محمد"></div>' +
                '<div class="form-group"><label>رقم الجوال</label><input type="text" id="vb-phone" placeholder="05xxxxxxxx" style="direction:ltr;"></div>' +
                '<div class="form-group"><label>رقم إضافي (اختياري)</label><input type="text" id="vb-phone2" placeholder="05xxxxxxxx" style="direction:ltr;"></div>' +
                '<div class="form-group"><label>ملاحظات</label><textarea id="vb-notes" rows="2" placeholder="أي ملاحظات..."></textarea></div>' +
              '</div>' +
              '<div class="modal-actions">' +
                '<button class="btn btn-outline" id="vb-cancel">إلغاء</button>' +
                '<button class="btn btn-ghost" id="vb-quick">حجز بدون بيانات</button>' +
                '<button class="btn btn-primary" id="vb-save"><i class="fa-solid fa-check"></i> حجز وحفظ</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(popup);
          popup.querySelector('#vb-cancel').addEventListener('click', () => document.body.removeChild(popup));
          popup.addEventListener('click', (e) => { if (e.target === popup) document.body.removeChild(popup); });

          const doBlock = async (withData) => {
            const result = await window.db.toggleVendorBooking(currentUser.id, dateStr);
            if (result && result.error) {
              window.UI.toast(result.error, 'error');
              return;
            }
            if (withData) {
              // Save vendor booking metadata to localStorage (private to vendor)
              const meta = JSON.parse(localStorage.getItem('vendor_bookings_meta') || '{}');
              meta[dateStr] = {
                name: document.getElementById('vb-name').value.trim(),
                phone: document.getElementById('vb-phone').value.trim(),
                phone2: document.getElementById('vb-phone2').value.trim(),
                notes: document.getElementById('vb-notes').value.trim()
              };
              localStorage.setItem('vendor_bookings_meta', JSON.stringify(meta));
            }
            document.body.removeChild(popup);
            window.UI.toast('تم حجز التاريخ بنجاح', 'success');
            drawCalendar();
          };

          popup.querySelector('#vb-quick').addEventListener('click', () => doBlock(false));
          popup.querySelector('#vb-save').addEventListener('click', () => doBlock(true));
        }
      });
    });
  };

  // Navigation events
  document.getElementById('cal-prev-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    drawCalendar();
  });
  document.getElementById('cal-next-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    drawCalendar();
  });
  document.getElementById('cal-prev-year').addEventListener('click', () => {
    currentYear++;
    drawCalendar();
  });
  document.getElementById('cal-next-year').addEventListener('click', () => {
    currentYear--;
    drawCalendar();
  });
  monthSelect.addEventListener('change', () => {
    currentMonth = parseInt(monthSelect.value);
    drawCalendar();
  });
  yearSelect.addEventListener('change', () => {
    currentYear = parseInt(yearSelect.value);
    drawCalendar();
  });
  document.getElementById('cal-today').addEventListener('click', () => {
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    drawCalendar();
  });

  drawCalendar();
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 4. PORTFOLIO
// ═══════════════════════════════════════════════════════════════

async function renderVendorPortfolio(container) {
  // Refresh user data
  const freshUser = await window.db.getVendor(currentUser.id);
  if (freshUser) currentUser = freshUser;

  let galleryHtml = '';
  if (currentUser.photos && currentUser.photos.length > 0) {
    currentUser.photos.forEach((p, idx) => {
      galleryHtml += '<div class="gallery-item">' +
        '<img src="' + p + '" alt="صورة ' + (idx + 1) + '">' +
        '<button class="btn btn-danger btn-icon btn-sm gallery-remove" onclick="window._removePhoto(' + idx + ')"><i class="fa-solid fa-trash"></i></button>' +
      '</div>';
    });
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-images" style="color:var(--primary);"></i> معرض الصور</h1><p class="page-subtitle">' + (currentUser.photos ? currentUser.photos.length : 0) + ' صورة</p></div></div>' +
      '<div class="card">' +
        '<div class="photo-uploader" id="drop-zone"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصور هنا أو انقر للاختيار</span></div>' +
        '<input type="file" id="file-input" accept="image/*" style="display:none;" multiple>' +
        '<div class="gallery">' + galleryHtml + '</div>' +
      '</div>' +
    '</div>';

  document.getElementById('drop-zone').addEventListener('click', () => document.getElementById('file-input').click());

  document.getElementById('file-input').addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(f => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (!currentUser.photos) currentUser.photos = [];
        currentUser.photos.push(ev.target.result);
        await window.db.updateVendor(currentUser);
        window.UI.toast('تمت إضافة الصورة', 'success');
        renderVendorPortfolio(container);
      };
      reader.readAsDataURL(f);
    });
  });

  window._removePhoto = async (idx) => {
    const ok = await window.UI.confirm('حذف هذه الصورة؟');
    if (ok) {
      currentUser.photos.splice(idx, 1);
      await window.db.updateVendor(currentUser);
      window.UI.toast('تم حذف الصورة', 'info');
      renderVendorPortfolio(container);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 5. REVIEWS
// ═══════════════════════════════════════════════════════════════

async function renderVendorReviews(container) {
  const reviews = await window.db.getVendorReviews(currentUser.id);

  let reviewsHtml = '';
  if (reviews.length === 0) {
    reviewsHtml = window.UI.emptyState('fa-star', 'لا توجد تقييمات بعد', 'ستظهر هنا تقييمات العملاء');
  } else {
    reviewsHtml = reviews.map(r => window.UI.reviewCard(r)).join('');
  }

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-star" style="color:var(--primary);"></i> التقييمات</h1><p class="page-subtitle">' + reviews.length + ' تقييم | المعدل: ' + currentUser.rating + '/5</p></div></div>' +
      '<div class="card mb-24">' +
        '<div style="display:flex; align-items:center; gap:16px;">' +
          '<div style="font-size:3rem; font-weight:800; color:var(--primary);">' + currentUser.rating + '</div>' +
          '<div>' + window.UI.starsHTML(currentUser.rating) + '<p class="text-sm text-muted mt-8">من ' + reviews.length + ' تقييم</p></div>' +
        '</div>' +
      '</div>' +
      '<div style="max-width:700px;">' + reviewsHtml + '</div>' +
    '</div>';
}

// ═══════════════════════════════════════════════════════════════
// VENDOR 6. PROFILE
// ═══════════════════════════════════════════════════════════════

async function renderVendorProfile(container) {
  const services = await window.db.getServices();
  let srvOpts = '';
  services.forEach(s => {
    srvOpts += '<option value="' + s.id + '" ' + (currentUser.serviceId === s.id ? 'selected' : '') + '>' + s.name + '</option>';
  });

  container.innerHTML =
    '<div class="animate-in">' +
      '<div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-id-card" style="color:var(--primary);"></i> الملف الشخصي</h1></div></div>' +
      '<div class="card" style="max-width:600px;">' +
        '<form id="profile-form">' +
          '<div class="form-group"><label>الاسم (لا يمكن تغييره)</label><input type="text" id="p-name" value="' + currentUser.name + '" disabled></div>' +
          '<div class="form-group"><label>البريد</label><input type="email" id="p-email" value="' + currentUser.email + '" disabled></div>' +
          '<div class="form-group"><label>الجوال الأساسي</label><input type="text" id="p-phone" value="' + (currentUser.phone || '') + '"></div>' +
          '<div class="form-group"><label>نوع الخدمة (لا يمكن تغييره)</label><select id="p-service" disabled>' + srvOpts + '</select></div>' +
          '<div class="form-group"><label>الموقع / العنوان (مثال: اسم القاعة أو المدينة)</label><input type="text" id="p-location" value="' + (currentUser.location || '') + '"></div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label>السعر الأساسي</label><input type="number" id="p-price" value="' + currentUser.price + '"></div>' +
            '<div class="form-group"><label>نوع التسعير</label><select id="p-pricing"><option value="flat" ' + (currentUser.pricingType === 'flat' ? 'selected' : '') + '>مقطوع</option><option value="perPerson" ' + (currentUser.pricingType === 'perPerson' ? 'selected' : '') + '>للشخص</option></select></div>' +
          '</div>' +
          '<div class="form-group"><label>السعة القصوى</label><input type="number" id="p-cap" value="' + (currentUser.maxCapacity || '') + '" placeholder="اختياري"></div>' +
          '<div class="form-group"><label>وصف الخدمة</label><textarea id="p-desc" rows="3">' + (currentUser.description || '') + '</textarea></div>' +
          
          '<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">' +
            '<h3><i class="fa-solid fa-address-book"></i> جهات اتصال إضافية</h3>' +
            '<div id="contacts-list" style="margin-top: 12px;"></div>' +
            '<button type="button" class="btn btn-outline btn-sm mt-8" id="btn-add-contact"><i class="fa-solid fa-plus"></i> إضافة رقم</button>' +
          '</div>' +
          
          '<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">' +
            '<h3><i class="fa-solid fa-moon"></i> زيادة سعر نهاية الأسبوع</h3>' +
            '<p class="text-sm text-muted mb-8">مبلغ إضافي يُضاف تلقائياً على السعر الأساسي عند الحجز في أيام الجمعة أو السبت</p>' +
            '<div class="form-row">' +
              '<div class="form-group"><label>زيادة يوم الجمعة (ر.س)</label><input type="number" id="p-fri-surcharge" value="' + (currentUser.fridaySurcharge || 0) + '" min="0" placeholder="0"></div>' +
              '<div class="form-group"><label>زيادة يوم السبت (ر.س)</label><input type="number" id="p-sat-surcharge" value="' + (currentUser.saturdaySurcharge || 0) + '" min="0" placeholder="0"></div>' +
            '</div>' +
          '</div>' +

          '<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">' +
            '<h3><i class="fa-solid fa-calendar-star"></i> أسعار تواريخ خاصة</h3>' +
            '<p class="text-sm text-muted mb-8">مبلغ إضافي يُضاف لتاريخ محدد (أعياد، مواسم). يتراكم مع زيادة نهاية الأسبوع.</p>' +
            '<div id="pricing-list" style="margin-top: 12px;"></div>' +
            '<button type="button" class="btn btn-outline btn-sm mt-8" id="btn-add-pricing"><i class="fa-solid fa-plus"></i> إضافة سعر لتاريخ</button>' +
          '</div>' +

          '<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">' +
            '<h3><i class="fa-solid fa-arrow-trend-up"></i> زيادة سعر من تاريخ معين فصاعداً</h3>' +
            '<p class="text-sm text-muted mb-8">مبلغ إضافي يسري على كل حجز بدءاً من تاريخ محدد (مثال: زيادة موسمية). يتراكم مع باقي الزيادات.</p>' +
            '<div id="forward-pricing-list" style="margin-top: 12px;"></div>' +
            '<button type="button" class="btn btn-outline btn-sm mt-8" id="btn-add-forward-pricing"><i class="fa-solid fa-plus"></i> إضافة زيادة</button>' +
          '</div>' +

          '<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">' +
            '<h3><i class="fa-solid fa-calendar-week"></i> حجز سريع لعطلات نهاية الأسبوع</h3>' +
            '<p class="text-sm text-muted mb-8">حظر جميع أيام الجمعة والسبت في شهر معين</p>' +
            '<div class="form-row">' +
              '<div class="form-group"><label>الشهر</label><select id="quick-block-month"><option value="0">يناير</option><option value="1">فبراير</option><option value="2">مارس</option><option value="3">أبريل</option><option value="4">مايو</option><option value="5">يونيو</option><option value="6">يوليو</option><option value="7">أغسطس</option><option value="8">سبتمبر</option><option value="9">أكتوبر</option><option value="10">نوفمبر</option><option value="11">ديسمبر</option></select></div>' +
              '<div class="form-group"><label>السنة</label><input type="number" id="quick-block-year" value="' + new Date().getFullYear() + '" min="2024" max="2030"></div>' +
            '</div>' +
            '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
              '<button type="button" class="btn btn-outline btn-sm" id="btn-block-fridays"><i class="fa-solid fa-moon"></i> حظر الجمعة فقط</button>' +
              '<button type="button" class="btn btn-outline btn-sm" id="btn-block-weekends"><i class="fa-solid fa-umbrella-beach"></i> حظر الجمعة + السبت</button>' +
            '</div>' +
          '</div>' +

          '<button type="submit" class="btn btn-primary" style="margin-top: 32px;"><i class="fa-solid fa-save"></i> حفظ التعديلات</button>' +
        '</form>' +
      '</div>' +
    '</div>';

  // Set quick-block month to current month
  document.getElementById('quick-block-month').value = new Date().getMonth();

  let contacts = [...(currentUser.contacts || [])];
  let specialPricing = [...(currentUser.specialPricing || [])];
  let dateForwardPricing = [...(currentUser.dateForwardPricing || [])];

  const renderContacts = () => {
    const list = document.getElementById('contacts-list');
    list.innerHTML = '';
    contacts.forEach((c, i) => {
      list.innerHTML += '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
        '<input type="text" placeholder="الاسم (مثال: الإدارة)" class="c-name flex-1" value="' + c.name + '">' +
        '<input type="text" placeholder="رقم الجوال" class="c-phone flex-1" value="' + c.phone + '">' +
        '<button type="button" class="btn btn-danger btn-icon" onclick="window._removeContact(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
      '</div>';
    });
  };

  const renderPricing = () => {
    const list = document.getElementById('pricing-list');
    list.innerHTML = '';
    specialPricing.forEach((p, i) => {
      list.innerHTML += '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
        '<input type="date" class="p-date flex-1" value="' + p.dateStr + '">' +
        '<input type="number" placeholder="المبلغ الإضافي" class="p-val flex-1" value="' + p.price + '">' +
        '<button type="button" class="btn btn-danger btn-icon" onclick="window._removePricing(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
      '</div>';
    });
  };

  window._removeContact = (i) => { contacts.splice(i, 1); renderContacts(); };
  window._removePricing = (i) => { specialPricing.splice(i, 1); renderPricing(); };
  window._removeForwardPricing = (i) => { dateForwardPricing.splice(i, 1); renderForwardPricing(); };

  const renderForwardPricing = () => {
    const list = document.getElementById('forward-pricing-list');
    list.innerHTML = '';
    dateForwardPricing.forEach((p, i) => {
      list.innerHTML += '<div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">' +
        '<input type="date" class="fp-date flex-1" value="' + (p.fromDate || '') + '">' +
        '<input type="number" placeholder="المبلغ الإضافي" class="fp-val" style="width:120px;" value="' + (p.surcharge || 0) + '">' +
        '<input type="text" placeholder="وصف (مثل: موسم)" class="fp-label flex-1" value="' + (p.label || '') + '">' +
        '<button type="button" class="btn btn-danger btn-icon" onclick="window._removeForwardPricing(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
      '</div>';
    });
  };

  document.getElementById('btn-add-contact').addEventListener('click', () => { contacts.push({ name: '', phone: '' }); renderContacts(); });
  document.getElementById('btn-add-pricing').addEventListener('click', () => { specialPricing.push({ dateStr: '', price: 0 }); renderPricing(); });
  document.getElementById('btn-add-forward-pricing').addEventListener('click', () => { dateForwardPricing.push({ fromDate: '', surcharge: 0, label: '' }); renderForwardPricing(); });

  // Quick block weekends
  const blockDays = async (dayNums) => {
    const month = parseInt(document.getElementById('quick-block-month').value);
    const year = parseInt(document.getElementById('quick-block-year').value);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let blocked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (dayNums.includes(date.getDay())) {
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const result = await window.db.getVendorBookings(currentUser.id);
        if (!result.includes(dateStr)) {
          await window.db.toggleVendorBooking(currentUser.id, dateStr);
          blocked++;
        }
      }
    }
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    window.UI.toast('تم حظر ' + blocked + ' يوم في ' + months[month] + ' ' + year, 'success');
  };
  document.getElementById('btn-block-fridays').addEventListener('click', () => blockDays([5])); // Friday = 5
  document.getElementById('btn-block-weekends').addEventListener('click', () => blockDays([5, 6])); // Fri + Sat

  renderContacts();
  renderPricing();
  renderForwardPricing();

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Update contacts state from DOM
    const cNames = document.querySelectorAll('.c-name');
    const cPhones = document.querySelectorAll('.c-phone');
    contacts = Array.from(cNames).map((el, i) => ({ name: el.value, phone: cPhones[i].value })).filter(c => c.name || c.phone);
    
    // Update pricing state from DOM
    const pDates = document.querySelectorAll('.p-date');
    const pVals = document.querySelectorAll('.p-val');
    specialPricing = Array.from(pDates).map((el, i) => ({ dateStr: el.value, price: parseInt(pVals[i].value) || 0 })).filter(p => p.dateStr && p.price > 0);

    // Update forward pricing from DOM
    const fpDates = document.querySelectorAll('.fp-date');
    const fpVals = document.querySelectorAll('.fp-val');
    const fpLabels = document.querySelectorAll('.fp-label');
    dateForwardPricing = Array.from(fpDates).map((el, i) => ({ fromDate: el.value, surcharge: parseInt(fpVals[i].value) || 0, label: fpLabels[i].value })).filter(p => p.fromDate && p.surcharge > 0);

    currentUser.phone = document.getElementById('p-phone').value.trim();
    currentUser.location = document.getElementById('p-location').value.trim();
    currentUser.price = parseInt(document.getElementById('p-price').value) || 0;
    currentUser.pricingType = document.getElementById('p-pricing').value;
    currentUser.maxCapacity = parseInt(document.getElementById('p-cap').value) || null;
    currentUser.description = document.getElementById('p-desc').value.trim();
    currentUser.contacts = contacts;
    currentUser.specialPricing = specialPricing;
    currentUser.dateForwardPricing = dateForwardPricing;
    currentUser.fridaySurcharge = parseInt(document.getElementById('p-fri-surcharge').value) || 0;
    currentUser.saturdaySurcharge = parseInt(document.getElementById('p-sat-surcharge').value) || 0;
    
    await window.db.updateVendor(currentUser);
    window.UI.toast('تم تحديث الملف الشخصي', 'success');
  });
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

initTheme();

// Auto-redirect to login if JWT expires
window._onAuthExpired = () => {
  currentUser = null;
  render();
};

window.db.init().then(() => {
  render();
}).catch(e => {
  console.error(e);
  app.innerHTML = '<div style="padding:60px; text-align:center;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--danger); margin-bottom:16px;"></i><h2>خطأ في الاتصال بالخادم</h2><p style="margin-top:8px; color:var(--text-muted);">تحقق من اتصالك بالإنترنت أو حاول لاحقاً</p></div>';
});
