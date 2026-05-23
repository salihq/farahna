// ═══════════════════════════════════════════════════════════════
// FARAHNA — Express Server Entry Point
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const { applySecurity } = require('./middleware/security');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ─────────────────────────────────────
applySecurity(app);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// ─── Start ───────────────────────────────────────────────────
async function start() {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Farahna server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
