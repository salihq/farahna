// ═══════════════════════════════════════════════════════════════
// FARAHNA — Express Server Entry Point
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { applySecurity } = require('./middleware/security');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Trust Proxy (required for Render / reverse proxies) ────
app.set('trust proxy', 1);

// ─── Security Middleware ─────────────────────────────────────
applySecurity(app);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Ensure DB Connection (critical for serverless) ─────────
let dbPromise = null;
function ensureDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!dbPromise) {
    dbPromise = connectDB().then(async () => {
      console.log('✅ MongoDB connected');
      if (process.env.NODE_ENV !== 'production') {
        await seedDatabase();
      }
    }).catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

// Wait for DB on every API request (serverless cold start protection)
app.use('/api', async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'خطأ في الاتصال بقاعدة البيانات. حاول مرة أخرى.' });
  }
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/vendors',       require('./routes/vendors'));
app.use('/api/clients',       require('./routes/clients'));
app.use('/api/plans',         require('./routes/plans'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/checklists',    require('./routes/checklists'));
app.use('/api/stats',         require('./routes/stats'));

// ─── SPA Fallback ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'حدث خطأ في الخادم'
    : err.message;
  res.status(status).json({ error: message });
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Only start the server if the file is executed directly
if (require.main === module) {
  ensureDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Farahna server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  });
}
