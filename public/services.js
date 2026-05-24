// ═══════════════════════════════════════════════════════════════
// LAYER 2: BUSINESS LOGIC — Services, Computations & Validation
// No DOM manipulation. No direct IndexedDB calls except through window.db.
// ═══════════════════════════════════════════════════════════════

window.Services = {};

// ═══════════════════════════════════════════════════════════════
// PRICING SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Pricing = {
  calculateVendorCost(vendor, guests, dateStr) {
    let base = vendor.pricingType === 'perPerson'
      ? vendor.price * (guests || 1)
      : vendor.price;

    // Add surcharges based on date
    if (dateStr) {
      const dayOfWeek = new Date(dateStr).getDay(); // 0=Sun, 5=Fri, 6=Sat

      // Weekend surcharges
      if (dayOfWeek === 5 && vendor.fridaySurcharge) {
        base += vendor.fridaySurcharge;
      }
      if (dayOfWeek === 6 && vendor.saturdaySurcharge) {
        base += vendor.saturdaySurcharge;
      }

      // Specific date surcharge
      if (vendor.specialPricing && vendor.specialPricing.length > 0) {
        const special = vendor.specialPricing.find(sp => sp.dateStr === dateStr);
        if (special && special.price) {
          base += special.price;
        }
      }

      // Date-range surcharges (from date X to date Y, add Z)
      if (vendor.dateForwardPricing && vendor.dateForwardPricing.length > 0) {
        for (const dfp of vendor.dateForwardPricing) {
          if (dfp.fromDate && dfp.surcharge && dateStr >= dfp.fromDate) {
            // If toDate is set, only apply within range
            if (!dfp.toDate || dateStr <= dfp.toDate) {
              base += dfp.surcharge;
            }
          }
        }
      }
    }

    return base;
  },

  calculateCartTotal(vendors, guests, dateStr) {
    return vendors.reduce((sum, v) => sum + this.calculateVendorCost(v, guests, dateStr), 0);
  },

  getBudgetStatus(total, budget) {
    if (!budget || budget <= 0) return { status: 'open', percentage: 0, remaining: 0, color: 'green' };
    const percentage = Math.round((total / budget) * 100);
    const remaining = budget - total;
    let status = 'safe';
    let color = 'green';
    if (percentage >= 100) { status = 'over'; color = 'red'; }
    else if (percentage >= 80) { status = 'warning'; color = 'yellow'; }
    return { status, percentage: Math.min(percentage, 100), remaining, color };
  },

  formatPrice(price) {
    return new Intl.NumberFormat('ar-SA').format(price) + ' شيكل';
  },

  getPriceLabel(vendor) {
    if (vendor.pricingType === 'perPerson') {
      return vendor.price + ' شيكل / شخص';
    }
    return this.formatPrice(vendor.price) + ' (مقطوع)';
  }
};

// ═══════════════════════════════════════════════════════════════
// SEARCH & FILTER SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Search = {
  filterVendors(vendors, filters) {
    let result = [...vendors];

    if (filters.serviceId && filters.serviceId !== 'all') {
      result = result.filter(v => v.serviceId === filters.serviceId);
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }

    if (filters.minRating) {
      result = result.filter(v => v.rating >= filters.minRating);
    }

    if (filters.maxPrice) {
      result = result.filter(v => v.price <= filters.maxPrice);
    }

    if (filters.minCapacity) {
      result = result.filter(v => !v.maxCapacity || v.maxCapacity >= filters.minCapacity);
    }

    return result;
  },

  sortVendors(vendors, sortBy, direction) {
    const dir = direction === 'asc' ? 1 : -1;
    return [...vendors].sort((a, b) => {
      switch (sortBy) {
        case 'price': return (a.price - b.price) * dir;
        case 'rating': return (a.rating - b.rating) * dir;
        case 'name': return a.name.localeCompare(b.name, 'ar') * dir;
        case 'capacity': return ((a.maxCapacity || 0) - (b.maxCapacity || 0)) * dir;
        default: return 0;
      }
    });
  },

  groupByService(vendors, services) {
    const groups = {};
    services.forEach(s => { groups[s.id] = { service: s, vendors: [] }; });
    vendors.forEach(v => {
      if (groups[v.serviceId]) groups[v.serviceId].vendors.push(v);
    });
    return Object.values(groups).filter(g => g.vendors.length > 0);
  }
};

// ═══════════════════════════════════════════════════════════════
// AVAILABILITY SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Availability = {
  async checkAvailability(vendorId, dateStr) {
    const dates = await window.db.getVendorBookings(vendorId);
    return !dates.includes(dateStr);
  },

  async filterAvailable(vendors, dateStr) {
    if (!dateStr) return vendors;
    const results = [];
    for (const v of vendors) {
      const avail = await this.checkAvailability(v.id, dateStr);
      if (avail) results.push(v);
    }
    return results;
  },

  checkCapacity(vendor, guests) {
    if (!vendor.maxCapacity) return { fits: true, max: null };
    return { fits: guests <= vendor.maxCapacity, max: vendor.maxCapacity };
  }
};

// ═══════════════════════════════════════════════════════════════
// STATISTICS SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Statistics = {
  async getDashboardStats() {
    const vendors = await window.db.getVendors();
    const clients = await window.db.getClients();
    const plans = await window.db.getPlans();
    const services = await window.db.getServices();

    const activePlans = plans.filter(p => p.status === 'confirmed');
    const totalRevenue = plans.reduce((s, p) => s + (p.totalCost || 0), 0);

    const today = new Date().toISOString().slice(0, 10);
    const upcomingWeddings = plans.filter(p => p.dateStr >= today && p.status === 'confirmed');

    return {
      totalVendors: vendors.length,
      totalClients: clients.length,
      totalPlans: plans.length,
      activePlans: activePlans.length,
      totalRevenue,
      totalServices: services.length,
      upcomingWeddings: upcomingWeddings.length
    };
  },

  async getServiceBreakdown() {
    const vendors = await window.db.getVendors();
    const services = await window.db.getServices();
    const plans = await window.db.getPlans();

    return services.map(s => {
      const srvVendors = vendors.filter(v => v.serviceId === s.id);
      const bookingCount = plans.reduce((count, p) => {
        return count + p.vendorIds.filter(vId => srvVendors.some(sv => sv.id === vId)).length;
      }, 0);
      return {
        service: s,
        vendorCount: srvVendors.length,
        bookingCount,
        avgPrice: srvVendors.length > 0 ? Math.round(srvVendors.reduce((s2, v) => s2 + v.price, 0) / srvVendors.length) : 0
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);
  },

  async getMonthlyBookings() {
    const plans = await window.db.getPlans();
    const months = {};
    plans.forEach(p => {
      const month = p.dateStr ? p.dateStr.slice(0, 7) : p.createdAt.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  },

  async getTopVendors(limit) {
    const vendors = await window.db.getVendors();
    const plans = await window.db.getPlans();
    
    const vendorBookings = {};
    plans.forEach(p => {
      p.vendorIds.forEach(vId => {
        vendorBookings[vId] = (vendorBookings[vId] || 0) + 1;
      });
    });

    return vendors
      .map(v => ({ ...v, bookings: vendorBookings[v.id] || 0 }))
      .sort((a, b) => b.bookings - a.bookings || b.rating - a.rating)
      .slice(0, limit || 10);
  }
};

// ═══════════════════════════════════════════════════════════════
// VALIDATION SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Validation = {
  validateClient(client) {
    const errors = [];
    if (!client.name || client.name.trim().length < 2) errors.push('الاسم مطلوب (حرفين على الأقل)');
    if (!client.phone || client.phone.trim().length < 8) errors.push('رقم الجوال مطلوب');
    if (client.budget && isNaN(Number(client.budget))) errors.push('الميزانية يجب أن تكون رقماً');
    return { valid: errors.length === 0, errors };
  },

  validateBooking(cart) {
    const errors = [];
    if (!cart.clientId) errors.push('يجب اختيار عميل للخطة');
    if (!cart.date) errors.push('يجب اختيار التاريخ');
    if (!cart.vendors || cart.vendors.length === 0) errors.push('يجب إضافة خدمة واحدة على الأقل');
    if (!cart.guests || cart.guests < 1) errors.push('عدد الحضور غير صحيح');
    
    // Check for duplicate service types
    const serviceTypes = cart.vendors.map(v => v.serviceId);
    const duplicates = serviceTypes.filter((s, i) => serviceTypes.indexOf(s) !== i);
    if (duplicates.length > 0) errors.push('يوجد أكثر من مزود لنفس الخدمة');

    return { valid: errors.length === 0, errors };
  },

  validateVendor(vendor) {
    const errors = [];
    if (!vendor.name || vendor.name.trim().length < 2) errors.push('اسم المزود مطلوب');
    if (!vendor.email) errors.push('البريد الإلكتروني مطلوب');
    if (!vendor.password) errors.push('كلمة المرور مطلوبة');
    if (!vendor.serviceId) errors.push('يجب اختيار نوع الخدمة');
    if (!vendor.price || vendor.price <= 0) errors.push('السعر يجب أن يكون أكبر من صفر');
    return { valid: errors.length === 0, errors };
  }
};

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Export = {
  async generatePlanHTML(planId) {
    const plan = await window.db.getPlan(planId);
    if (!plan) return '<p>الخطة غير موجودة</p>';

    const client = plan.clientId ? await window.db.getClient(plan.clientId) : null;
    const services = await window.db.getServices();
    const vendorDetails = [];
    for (const vId of plan.vendorIds) {
      const v = await window.db.getVendor(vId);
      if (v) {
        const srv = services.find(s => s.id === v.serviceId);
        vendorDetails.push({ vendor: v, service: srv });
      }
    }

    let rows = '';
    vendorDetails.forEach((vd, i) => {
      const cost = vd.vendor.pricingType === 'perPerson'
        ? vd.vendor.price * plan.guests
        : vd.vendor.price;
      rows += '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + (vd.service ? vd.service.name : '-') + '</td>' +
        '<td>' + vd.vendor.name + '</td>' +
        '<td>' + vd.vendor.phone + '</td>' +
        '<td>' + window.Services.Pricing.formatPrice(cost) + '</td>' +
        '</tr>';
    });

    return '<!DOCTYPE html><html lang="ar" dir="rtl"><head>' +
      '<meta charset="UTF-8">' +
      '<title>خطة الزفاف - ' + (client ? client.name : 'بدون عميل') + '</title>' +
      '<style>body{font-family:Cairo,Arial,sans-serif;padding:40px;color:#333}' +
      'h1{color:#c9a227;border-bottom:3px solid #c9a227;padding-bottom:12px}' +
      'table{width:100%;border-collapse:collapse;margin-top:20px}' +
      'th,td{border:1px solid #ddd;padding:12px;text-align:right}' +
      'th{background:#f5f5f5;font-weight:700}' +
      '.info{display:flex;gap:40px;margin:20px 0;flex-wrap:wrap}' +
      '.info-item{background:#f9f9f9;padding:16px 24px;border-radius:8px;border-right:4px solid #c9a227}' +
      '.total{font-size:1.4rem;font-weight:800;color:#c9a227;margin-top:24px;text-align:left}' +
      '@media print{body{padding:20px}}</style></head><body>' +
      '<h1>خطة حفل الزفاف</h1>' +
      '<div class="info">' +
        '<div class="info-item"><strong>العميل:</strong> ' + (client ? client.name : 'غير محدد') + '</div>' +
        '<div class="info-item"><strong>التاريخ:</strong> ' + plan.dateStr + '</div>' +
        '<div class="info-item"><strong>عدد الحضور:</strong> ' + plan.guests + ' شخص</div>' +
        '<div class="info-item"><strong>الحالة:</strong> ' + (plan.status === 'confirmed' ? 'مؤكد' : plan.status) + '</div>' +
      '</div>' +
      '<table><thead><tr><th>#</th><th>الخدمة</th><th>المزود</th><th>الجوال</th><th>التكلفة</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' +
      '<div class="total">الإجمالي: ' + window.Services.Pricing.formatPrice(plan.totalCost) + '</div>' +
      '<p style="margin-top:40px;color:#999;font-size:0.85rem">تم إنشاء هذا التقرير بواسطة نظام تنظيم الزفاف | ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
      '</body></html>';
  },

  async printPlan(planId) {
    const html = await this.generatePlanHTML(planId);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPARISON SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Comparison = {
  async compareVendors(vendorIds, guests) {
    const vendors = [];
    for (const id of vendorIds) {
      const v = await window.db.getVendor(id);
      if (v) {
        const reviews = await window.db.getVendorReviews(id);
        vendors.push({ ...v, reviewCount: reviews.length, totalCost: window.Services.Pricing.calculateVendorCost(v, guests) });
      }
    }
    return vendors;
  }
};

// ═══════════════════════════════════════════════════════════════
// CHECKLIST SERVICE
// ═══════════════════════════════════════════════════════════════

window.Services.Checklist = {
  getCategoryLabel(cat) {
    const labels = {
      '6months': 'قبل 6 أشهر',
      '3months': 'قبل 3 أشهر',
      '1month': 'قبل شهر',
      '1week': 'قبل أسبوع',
      'dayof': 'يوم الزفاف'
    };
    return labels[cat] || cat;
  },

  getCategoryIcon(cat) {
    const icons = {
      '6months': 'fa-calendar-plus',
      '3months': 'fa-calendar-check',
      '1month': 'fa-calendar-day',
      '1week': 'fa-calendar-week',
      'dayof': 'fa-champagne-glasses'
    };
    return icons[cat] || 'fa-circle-check';
  },

  getProgress(items) {
    if (!items || items.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = items.filter(i => i.done).length;
    return { completed, total: items.length, percentage: Math.round((completed / items.length) * 100) };
  },

  groupByCategory(items) {
    const order = ['6months', '3months', '1month', '1week', 'dayof'];
    const groups = {};
    items.forEach(item => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    // Sort by defined order
    const sorted = {};
    order.forEach(key => { if (groups[key]) sorted[key] = groups[key]; });
    // Add any remaining
    Object.keys(groups).forEach(key => { if (!sorted[key]) sorted[key] = groups[key]; });
    return sorted;
  }
};

// ═══════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════

window.Services.DateUtils = {
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  },

  formatDateTime(isoStr) {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return isoStr; }
  },

  timeAgo(isoStr) {
    const now = new Date();
    const then = new Date(isoStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return Math.floor(diff / 60) + ' دقيقة';
    if (diff < 86400) return Math.floor(diff / 3600) + ' ساعة';
    if (diff < 2592000) return Math.floor(diff / 86400) + ' يوم';
    return Math.floor(diff / 2592000) + ' شهر';
  },

  isToday(dateStr) {
    return dateStr === new Date().toISOString().slice(0, 10);
  },

  isFuture(dateStr) {
    return dateStr > new Date().toISOString().slice(0, 10);
  }
};
