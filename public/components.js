// ═══════════════════════════════════════════════════════════════
// LAYER 3 (Part A): REUSABLE UI COMPONENTS
// Pure HTML generators and UI utilities. No business logic.
// ═══════════════════════════════════════════════════════════════

window.UI = {};

// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════

(function() {
  let container = null;

  function ensureContainer() {
    if (!container || !document.body.contains(container)) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.UI.toast = function(message, type) {
    type = type || 'info';
    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info',
      warning: 'fa-triangle-exclamation'
    };
    const c = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<i class="fa-solid ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    c.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
  };
})();

// ═══════════════════════════════════════════════════════════════
// MODAL DIALOG SYSTEM
// ═══════════════════════════════════════════════════════════════

window.UI.modal = function(options) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const icon = options.icon ? '<i class="fa-solid ' + options.icon + '" style="color: var(--primary);"></i>' : '';
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-title">' + icon + (options.title || 'تأكيد') + '</div>' +
        '<div class="modal-body">' + (options.body || '') + '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" id="modal-cancel">' + (options.cancelText || 'إلغاء') + '</button>' +
          '<button class="btn btn-primary" id="modal-confirm">' + (options.confirmText || 'تأكيد') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#modal-confirm').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });
    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { document.body.removeChild(overlay); resolve(false); }
    });
  });
};

window.UI.confirm = function(message) {
  return window.UI.modal({ title: 'تأكيد', body: message, icon: 'fa-question-circle', confirmText: 'نعم', cancelText: 'لا' });
};

window.UI.alert = function(message, title) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-box">' +
        '<div class="modal-title"><i class="fa-solid fa-circle-info" style="color: var(--primary);"></i>' + (title || 'تنبيه') + '</div>' +
        '<div class="modal-body">' + message + '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-primary" id="modal-ok">حسناً</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-ok').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });
  });
};

// ═══════════════════════════════════════════════════════════════
// STAR RATING (HTML Generator)
// ═══════════════════════════════════════════════════════════════

window.UI.starsHTML = function(rating, max) {
  max = max || 5;
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    html += i <= rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
  }
  return html + '</div>';
};

window.UI.interactiveStarsHTML = function(currentRating, inputName) {
  let html = '<div class="stars interactive" data-input="' + inputName + '">';
  for (let i = 1; i <= 5; i++) {
    html += '<i class="' + (i <= currentRating ? 'fa-solid' : 'fa-regular') + ' fa-star" data-value="' + i + '"></i>';
  }
  return html + '</div>';
};

// Attach interactive behavior after rendering
window.UI.bindStarRatings = function(container) {
  container.querySelectorAll('.stars.interactive').forEach(starsEl => {
    starsEl.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value);
        const inputName = starsEl.dataset.input;
        starsEl.querySelectorAll('i').forEach((s, idx) => {
          s.className = (idx < val ? 'fa-solid' : 'fa-regular') + ' fa-star';
        });
        starsEl.dataset.rating = val;
        // Update hidden input if exists
        const input = container.querySelector('[name="' + inputName + '"]');
        if (input) input.value = val;
      });
    });
  });
};

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════

window.UI.progressBar = function(percentage, color, label) {
  color = color || '';
  const colorClass = color === 'green' ? 'green' : color === 'yellow' ? 'yellow' : color === 'red' ? 'red' : '';
  let html = '<div class="progress-bar"><div class="progress-fill ' + colorClass + '" style="width: ' + percentage + '%;"></div></div>';
  if (label) {
    html += '<div class="progress-label"><span>' + label + '</span><span>' + percentage + '%</span></div>';
  }
  return html;
};

// ═══════════════════════════════════════════════════════════════
// STAT WIDGET
// ═══════════════════════════════════════════════════════════════

window.UI.statWidget = function(icon, label, value, bgColor, textColor) {
  bgColor = bgColor || 'var(--primary-glow)';
  textColor = textColor || 'var(--primary)';
  return '<div class="stat-widget">' +
    '<div class="stat-icon" style="background: ' + bgColor + '; color: ' + textColor + ';">' +
      '<i class="fa-solid ' + icon + '"></i>' +
    '</div>' +
    '<div class="stat-info">' +
      '<h4>' + label + '</h4>' +
      '<p>' + value + '</p>' +
    '</div>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════

window.UI.badge = function(text, type) {
  type = type || 'primary';
  return '<span class="badge badge-' + type + '">' + text + '</span>';
};

window.UI.statusBadge = function(status) {
  const map = {
    'confirmed': { text: 'مؤكد', type: 'success' },
    'pending': { text: 'معلق', type: 'warning' },
    'completed': { text: 'مكتمل', type: 'info' },
    'cancelled': { text: 'ملغي', type: 'danger' },
    'active': { text: 'نشط', type: 'success' },
    'booked': { text: 'محجوز', type: 'primary' }
  };
  const info = map[status] || { text: status, type: 'neutral' };
  return window.UI.badge(info.text, info.type);
};

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

window.UI.emptyState = function(icon, title, message) {
  return '<div class="empty-state">' +
    '<i class="fa-solid ' + icon + '"></i>' +
    '<h3>' + title + '</h3>' +
    '<p>' + (message || '') + '</p>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════

window.UI.loading = function(message) {
  return '<div class="loading-container">' +
    '<div class="spinner"></div>' +
    '<span class="text-muted">' + (message || 'جاري التحميل...') + '</span>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// VENDOR CARD
// ═══════════════════════════════════════════════════════════════

window.UI.vendorCard = function(vendor, serviceName, options) {
  options = options || {};
  const photo = vendor.photos && vendor.photos.length > 0
    ? '<img class="card-image" src="' + vendor.photos[0] + '" alt="' + vendor.name + '">'
    : '';

  const priceLabel = window.Services.Pricing.getPriceLabel(vendor);
  const capacityInfo = vendor.maxCapacity
    ? '<div class="text-xs mt-8" style="color: var(--warning);"><i class="fa-solid fa-users"></i> سعة قصوى: ' + vendor.maxCapacity + ' شخص</div>'
    : '';

  const descInfo = vendor.description
    ? '<p class="text-sm text-muted mt-8" style="line-height:1.5;">' + vendor.description + '</p>'
    : '';

  let actions = '';
  if (options.isInCart) {
    actions = '<button class="btn btn-outline btn-sm" disabled><i class="fa-solid fa-check"></i> في السلة</button>';
  } else if (options.isOverCapacity) {
    actions = '<button class="btn btn-danger btn-sm" disabled><i class="fa-solid fa-ban"></i> يتجاوز السعة</button>';
  } else if (options.onAdd) {
    actions = '<button class="btn btn-primary btn-sm" onclick="' + options.onAdd + '"><i class="fa-solid fa-plus"></i> أضف للخطة</button>';
  }

  if (options.onCompare) {
    actions += ' <button class="btn btn-outline btn-sm" onclick="' + options.onCompare + '"><i class="fa-solid fa-scale-balanced"></i></button>';
  }

  let borderStyle = '';
  if (options.isInCart) borderStyle = 'border: 2px solid var(--primary);';
  else if (options.isOverCapacity) borderStyle = 'border: 2px solid var(--danger); opacity: 0.7;';

  return '<div class="card" style="' + borderStyle + '">' +
    photo +
    '<div class="card-header">' +
      '<span class="card-title truncate">' + vendor.name + '</span>' +
    '</div>' +
    (serviceName ? window.UI.badge(serviceName, 'gold') : '') +
    descInfo +
    '<div class="mt-8">' + window.UI.starsHTML(vendor.rating) + '</div>' +
    '<p style="margin-top: 8px; font-weight: 700;"><i class="fa-solid fa-tag"></i> ' + priceLabel + '</p>' +
    capacityInfo +
    '<div class="card-footer">' + actions + '</div>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG ITEM
// ═══════════════════════════════════════════════════════════════

window.UI.activityItem = function(entry) {
  const colors = {
    system: 'var(--info)',
    vendor: 'var(--success)',
    client: 'var(--warning)',
    plan: 'var(--primary)'
  };
  const color = colors[entry.type] || 'var(--text-muted)';
  return '<div class="activity-item">' +
    '<div class="activity-dot" style="background: ' + color + ';"></div>' +
    '<div>' +
      '<div class="activity-text">' + entry.message + '</div>' +
      '<div class="activity-time">' + window.Services.DateUtils.timeAgo(entry.date) + '</div>' +
    '</div>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// REVIEW CARD
// ═══════════════════════════════════════════════════════════════

window.UI.reviewCard = function(review) {
  return '<div class="review-card">' +
    '<div class="review-header">' +
      '<div>' +
        '<span class="review-author">' + review.reviewerName + '</span>' +
        '<div class="mt-8">' + window.UI.starsHTML(review.rating) + '</div>' +
      '</div>' +
      '<span class="review-date">' + window.Services.DateUtils.timeAgo(review.date) + '</span>' +
    '</div>' +
    '<p class="review-text mt-8">' + review.comment + '</p>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// CHECKLIST ITEM
// ═══════════════════════════════════════════════════════════════

window.UI.checklistItem = function(item) {
  const doneClass = item.done ? 'done' : '';
  const checkIcon = item.done ? '<i class="fa-solid fa-check" style="font-size:0.7rem;"></i>' : '';
  return '<div class="checklist-item ' + doneClass + '" data-id="' + item.id + '">' +
    '<div class="check-icon">' + checkIcon + '</div>' +
    '<span style="flex:1;">' + item.text + '</span>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION CARD
// ═══════════════════════════════════════════════════════════════

window.UI.notifCard = function(notif) {
  const readClass = notif.read ? 'read' : '';
  return '<div class="notif-card ' + readClass + '" data-id="' + notif.id + '">' +
    '<div class="notif-date">' + window.Services.DateUtils.formatDateTime(notif.date) + '</div>' +
    '<h3 style="margin-bottom: 8px; font-size: 1rem;">' + notif.message + '</h3>' +
    '<p class="text-sm"><i class="fa-solid fa-calendar"></i> التاريخ: <strong>' + (notif.details.date || '-') + '</strong></p>' +
    '<p class="text-sm"><i class="fa-solid fa-user"></i> العميل: ' + (notif.details.clientName || '-') + ' (' + (notif.details.guests || '?') + ' شخص)</p>' +
    '<p class="text-sm"><i class="fa-solid fa-sitemap"></i> المنظم: ' + (notif.details.organizerName || '-') + '</p>' +
  '</div>';
};

// ═══════════════════════════════════════════════════════════════
// SIMPLE BAR CHART (CSS-only)
// ═══════════════════════════════════════════════════════════════

window.UI.barChart = function(data, options) {
  options = options || {};
  const maxVal = Math.max(...data.map(d => d.value), 1);
  let html = '<div style="display: flex; align-items: flex-end; gap: 8px; height: ' + (options.height || 200) + 'px; padding: 0 8px;">';
  data.forEach(d => {
    const pct = (d.value / maxVal) * 100;
    html += '<div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;">' +
      '<span class="text-xs" style="margin-bottom:4px; font-weight:700;">' + d.value + '</span>' +
      '<div style="width:100%; max-width:40px; height:' + pct + '%; background: linear-gradient(to top, var(--primary), var(--primary-light)); border-radius: 6px 6px 0 0; min-height:4px; transition: height 0.6s ease;"></div>' +
      '<span class="text-xs text-muted" style="margin-top:6px; writing-mode: vertical-lr; transform: rotate(180deg); max-height:60px; overflow:hidden;">' + d.label + '</span>' +
    '</div>';
  });
  return html + '</div>';
};

// ═══════════════════════════════════════════════════════════════
// COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════

window.UI.comparisonTable = function(vendors, services, guests) {
  if (!vendors || vendors.length === 0) return window.UI.emptyState('fa-scale-balanced', 'لا توجد مقارنات', 'اختر مزودين للمقارنة');

  let headerCells = '<th>المعيار</th>';
  vendors.forEach(v => { headerCells += '<th>' + v.name + '</th>'; });

  const rows = [
    { label: 'الخدمة', key: 'service' },
    { label: 'التقييم', key: 'rating' },
    { label: 'السعر', key: 'price' },
    { label: 'التكلفة الإجمالية', key: 'totalCost' },
    { label: 'السعة القصوى', key: 'capacity' },
    { label: 'عدد التقييمات', key: 'reviewCount' },
    { label: 'الوصف', key: 'description' }
  ];

  let bodyRows = '';
  rows.forEach(row => {
    bodyRows += '<tr><td>' + row.label + '</td>';
    vendors.forEach(v => {
      let val = '';
      switch (row.key) {
        case 'service': {
          const srv = services.find(s => s.id === v.serviceId);
          val = srv ? srv.name : '-';
          break;
        }
        case 'rating': val = window.UI.starsHTML(v.rating); break;
        case 'price': val = window.Services.Pricing.getPriceLabel(v); break;
        case 'totalCost': val = window.Services.Pricing.formatPrice(v.totalCost || window.Services.Pricing.calculateVendorCost(v, guests)); break;
        case 'capacity': val = v.maxCapacity ? v.maxCapacity + ' شخص' : 'غير محدود'; break;
        case 'reviewCount': val = (v.reviewCount || 0) + ' تقييم'; break;
        case 'description': val = v.description || '-'; break;
      }
      bodyRows += '<td>' + val + '</td>';
    });
    bodyRows += '</tr>';
  });

  return '<table class="comparison-table">' +
    '<thead><tr>' + headerCells + '</tr></thead>' +
    '<tbody>' + bodyRows + '</tbody>' +
  '</table>';
};

// ═══════════════════════════════════════════════════════════════
// SKELETON LOADING COMPONENTS
// ═══════════════════════════════════════════════════════════════

window.UI.skeleton = function(type, count) {
  count = count || 1;
  var html = '';
  for (var i = 0; i < count; i++) {
    switch (type) {
      case 'card':
        html += '<div class="skeleton skeleton-card"></div>';
        break;
      case 'row':
        html += '<div class="skeleton skeleton-row"></div>';
        break;
      case 'stat':
        html += '<div class="skeleton skeleton-stat"></div>';
        break;
      default:
        html += '<div class="skeleton skeleton-card"></div>';
    }
  }
  return html;
};

window.UI.skeletonGrid = function(count) {
  count = count || 6;
  var html = '<div class="grid">';
  for (var i = 0; i < count; i++) {
    html += '<div class="skeleton skeleton-card"></div>';
  }
  return html + '</div>';
};

window.UI.skeletonTable = function(rows) {
  rows = rows || 5;
  var html = '';
  for (var i = 0; i < rows; i++) {
    html += '<div class="skeleton skeleton-row"></div>';
  }
  return html;
};

// ═══════════════════════════════════════════════════════════════
// CONTACTS LIST COMPONENT
// ═══════════════════════════════════════════════════════════════

window.UI.contactsList = function(contacts) {
  if (!contacts || contacts.length === 0) return '<span class="text-muted">-</span>';
  var html = '';
  contacts.forEach(function(c) {
    html += '<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">' +
      '<i class="fa-solid fa-user-tag" style="color:var(--primary); font-size:0.8rem;"></i>' +
      '<span style="font-weight:600;">' + (c.name || '') + '</span>' +
      (c.role ? '<span class="badge badge-info" style="font-size:0.7rem;">' + c.role + '</span>' : '') +
      (c.phone ? '<span class="text-muted text-sm" style="direction:ltr;font-family:Inter,sans-serif;"><i class="fa-solid fa-phone" style="font-size:0.7rem;margin-left:4px;"></i> ' + c.phone + '</span>' : '') +
    '</div>';
  });
  return html;
};

// ═══════════════════════════════════════════════════════════════
// EVENT TYPE BADGE
// ═══════════════════════════════════════════════════════════════

window.UI.eventTypeBadge = function(eventType) {
  var icons = {
    'زفاف': 'fa-rings-wedding',
    'خطوبة': 'fa-ring',
    'عقد قران': 'fa-scroll',
    'حفل تخرج': 'fa-graduation-cap',
    'أخرى': 'fa-calendar-star'
  };
  var icon = icons[eventType] || 'fa-calendar-star';
  return '<span class="event-type-badge"><i class="fa-solid ' + icon + '"></i> ' + (eventType || 'زفاف') + '</span>';
};

// ═══════════════════════════════════════════════════════════════
// RESERVATION DETAIL CARD
// ═══════════════════════════════════════════════════════════════

window.UI.reservationDetailCard = function(plan, vendors, services) {
  vendors = vendors || [];
  services = services || [];

  // Event info section
  var eventSection = '<div class="detail-section">' +
    '<h4><i class="fa-solid fa-champagne-glasses"></i> تفاصيل المناسبة</h4>' +
    '<div class="detail-row"><span class="detail-label">اسم الخطة</span><span class="detail-value">' + (plan.name || '-') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">نوع المناسبة</span><span class="detail-value">' + window.UI.eventTypeBadge(plan.eventType) + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">التاريخ</span><span class="detail-value" style="font-family:Inter,sans-serif;">' + (plan.dateStr || '-') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">الوقت</span><span class="detail-value">' + (plan.eventTime === 'صباحي' ? '<i class="fa-solid fa-sun"></i> صباحي' : '<i class="fa-solid fa-moon"></i> مسائي') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">عدد الضيوف</span><span class="detail-value" style="font-family:Inter,sans-serif;">' + (plan.guests || '-') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">المكان</span><span class="detail-value">' + (plan.venue || '-') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">الحالة</span><span class="detail-value">' + window.UI.statusBadge(plan.status) + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">التكلفة</span><span class="detail-value" style="font-family:Inter,sans-serif;font-weight:800;color:var(--primary);">' + (plan.totalCost ? plan.totalCost.toLocaleString() + ' ر.س' : '-') + '</span></div>' +
  '</div>';

  // Booking info section
  var bookedBy = plan.bookedBy || {};
  var bookingSection = '<div class="detail-section">' +
    '<h4><i class="fa-solid fa-user-check"></i> معلومات الحاجز</h4>' +
    '<div class="detail-row"><span class="detail-label">اسم الحاجز</span><span class="detail-value">' + (bookedBy.name || '-') + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">المصدر</span><span class="detail-value">' + window.UI.badge(bookedBy.source === 'website' ? 'الموقع' : (bookedBy.source === 'organizer' ? 'منظم' : 'خارجي'), bookedBy.source === 'website' ? 'info' : (bookedBy.source === 'organizer' ? 'success' : 'warning')) + '</span></div>' +
    '<div class="detail-row"><span class="detail-label">العميل</span><span class="detail-value">' + (plan.clientName || '-') + '</span></div>' +
    '<div style="margin-top:12px;"><strong style="font-size:0.85rem;">جهات الاتصال:</strong>' +
    '<div style="margin-top:8px;">' + window.UI.contactsList(bookedBy.contacts) + '</div></div>' +
    (bookedBy.notes ? '<div style="margin-top:12px;padding:10px;background:var(--warning-light);border-radius:var(--radius-sm);font-size:0.85rem;"><i class="fa-solid fa-note-sticky" style="color:var(--warning);margin-left:6px;"></i>' + bookedBy.notes + '</div>' : '') +
  '</div>';

  // Vendors section
  var vendorPlanIds = plan.vendorIds || [];
  var vendorCards = '';
  vendors.forEach(function(v) {
    if (vendorPlanIds.indexOf(v._id || v.id) === -1) return;
    var svc = services.find(function(s) { return s._id === v.serviceId || s.id === v.serviceId; });
    vendorCards += '<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border);">' +
      '<div style="width:40px;height:40px;border-radius:50%;background:var(--primary-glow);display:flex;align-items:center;justify-content:center;"><i class="fa-solid ' + (svc ? svc.icon : 'fa-star') + '" style="color:var(--primary);"></i></div>' +
      '<div style="flex:1;"><div style="font-weight:700;">' + v.name + '</div><div class="text-sm text-muted">' + (svc ? svc.name : '-') + '</div></div>' +
      '<div style="font-family:Inter,sans-serif;font-weight:700;color:var(--primary);">' + (v.price || 0).toLocaleString() + ' ر.س</div>' +
    '</div>';
  });

  var vendorSection = '<div class="detail-section" style="grid-column:1/-1;">' +
    '<h4><i class="fa-solid fa-store"></i> المزودون (' + vendorPlanIds.length + ')</h4>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' + (vendorCards || '<p class="text-muted">لا يوجد مزودون</p>') + '</div>' +
  '</div>';

  // Special requests
  var requestsSection = '';
  if (plan.specialRequests) {
    requestsSection = '<div class="detail-section" style="grid-column:1/-1;">' +
      '<h4><i class="fa-solid fa-clipboard-list"></i> طلبات خاصة</h4>' +
      '<p style="font-size:0.9rem;line-height:1.8;">' + plan.specialRequests + '</p>' +
    '</div>';
  }

  return '<div class="reservation-detail">' + eventSection + bookingSection + vendorSection + requestsSection + '</div>';
};
