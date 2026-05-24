// ═══════════════════════════════════════════════════════════════
// API CLIENT — Replaces IndexedDB data.js with REST API calls
// Exposes the SAME window.db.* interface for zero-change migration
// ═══════════════════════════════════════════════════════════════

window.db = {};

// ─── Internal Helpers ───────────────────────────────────────

function getToken() {
  return localStorage.getItem('farahna_token');
}

function setToken(token) {
  localStorage.setItem('farahna_token', token);
}

function clearToken() {
  localStorage.removeItem('farahna_token');
}

async function api(url, options) {
  const opts = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  const token = getToken();
  if (token) {
    opts.headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(url, opts);

  if (res.status === 401) {
    clearToken();
    // Token expired or invalid — force re-login
    if (window._onAuthExpired) window._onAuthExpired();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }

  // Some endpoints return no content
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ═══════════════════════════════════════════════════════════════
// INIT — Check if user is logged in
// ═══════════════════════════════════════════════════════════════

window.db.init = async function() {
  // Nothing to initialize — MongoDB is on the server
  // Just verify token if one exists
  const token = getToken();
  if (token) {
    try {
      await api('/api/auth/me');
    } catch (e) {
      clearToken();
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

window.db.login = async function(email, password) {
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data && data.token) {
      setToken(data.token);
      return data.user;
    }
    return null;
  } catch (e) {
    return null;
  }
};

window.db.logout = function() {
  clearToken();
};

// ═══════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════

window.db.getServices = async function() {
  return await api('/api/stats/services');
};

// ═══════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════

window.db.getVendors = async function() {
  return await api('/api/vendors');
};

window.db.getVendor = async function(id) {
  return await api('/api/vendors/' + id);
};

window.db.addVendor = async function(vendor) {
  return await api('/api/vendors', {
    method: 'POST',
    body: JSON.stringify(vendor)
  });
};

window.db.updateVendor = async function(vendor) {
  return await api('/api/vendors/' + (vendor._id || vendor.id), {
    method: 'PUT',
    body: JSON.stringify(vendor)
  });
};

window.db.deleteVendor = async function(id) {
  return await api('/api/vendors/' + id, { method: 'DELETE' });
};

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════

window.db.getVendorBookings = async function(vendorId) {
  const data = await api('/api/bookings/' + vendorId);
  return data ? data.dates : [];
};

window.db.toggleVendorBooking = async function(vendorId, dateStr) {
  const data = await api('/api/bookings/' + vendorId + '/toggle', {
    method: 'POST',
    body: JSON.stringify({ dateStr })
  });
  return data ? data.dates : [];
};

window.db.addBookingDate = async function(vendorId, dateStr) {
  // This is handled server-side during reservation
};

// ═══════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════

window.db.getClients = async function() {
  return await api('/api/clients');
};

window.db.getClient = async function(id) {
  return await api('/api/clients/' + id);
};

window.db.addClient = async function(client) {
  return await api('/api/clients', {
    method: 'POST',
    body: JSON.stringify(client)
  });
};

window.db.updateClient = async function(client) {
  return await api('/api/clients/' + (client._id || client.id), {
    method: 'PUT',
    body: JSON.stringify(client)
  });
};

window.db.deleteClient = async function(id) {
  return await api('/api/clients/' + id, { method: 'DELETE' });
};

// ═══════════════════════════════════════════════════════════════
// PLANS / RESERVATIONS
// ═══════════════════════════════════════════════════════════════

window.db.getPlans = async function() {
  return await api('/api/plans');
};

window.db.getPlan = async function(id) {
  return await api('/api/plans/' + id);
};

window.db.updatePlan = async function(plan) {
  return await api('/api/plans/' + (plan._id || plan.id), {
    method: 'PUT',
    body: JSON.stringify(plan)
  });
};

window.db.reservePlan = async function(planData) {
  return await api('/api/plans/reserve', {
    method: 'POST',
    body: JSON.stringify(planData)
  });
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

window.db.getVendorNotifications = async function(vendorId) {
  return await api('/api/notifications');
};

window.db.markNotificationRead = async function(id) {
  return await api('/api/notifications/' + id + '/read', { method: 'PUT' });
};

window.db.markAllNotificationsRead = async function(vendorId) {
  return await api('/api/notifications/read-all', { method: 'PUT' });
};

window.db.addNotification = async function(vendorId, message, details) {
  // Handled server-side during reservation
};

// ═══════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════

window.db.getVendorReviews = async function(vendorId) {
  return await api('/api/reviews/' + vendorId);
};

window.db.addReview = async function(vendorId, reviewerName, rating, comment) {
  return await api('/api/reviews/' + vendorId, {
    method: 'POST',
    body: JSON.stringify({ reviewerName, rating, comment })
  });
};

// ═══════════════════════════════════════════════════════════════
// CHECKLISTS
// ═══════════════════════════════════════════════════════════════

window.db.getChecklist = async function(planId) {
  return await api('/api/checklists/' + planId);
};

window.db.addChecklistItem = async function(item) {
  return await api('/api/checklists', {
    method: 'POST',
    body: JSON.stringify(item)
  });
};

window.db.updateChecklistItem = async function(item) {
  return await api('/api/checklists/' + (item._id || item.id), {
    method: 'PUT',
    body: JSON.stringify(item)
  });
};

window.db.deleteChecklistItem = async function(id) {
  return await api('/api/checklists/' + id, { method: 'DELETE' });
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════

window.db.logActivity = async function(type, message) {
  return await api('/api/stats/activity', {
    method: 'POST',
    body: JSON.stringify({ type, message })
  });
};

window.db.getActivityLog = async function(limit) {
  return await api('/api/stats/activity?limit=' + (limit || 20));
};

// ═══════════════════════════════════════════════════════════════
// SEARCH (Available Vendors)
// ═══════════════════════════════════════════════════════════════

window.db.searchAvailableVendors = async function(dateStr, serviceId) {
  let url = '/api/bookings/available/search?';
  if (dateStr) url += 'date=' + dateStr + '&';
  if (serviceId && serviceId !== 'all') url += 'serviceId=' + serviceId;
  return await api(url);
};
