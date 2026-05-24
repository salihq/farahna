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

// ─── Trust Proxy (required for Render / reverse proxies) ────
app.set('trust proxy', 1);

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

// ─── Database & Serverless Setup ─────────────────────────────
// Connect to DB asynchronously (essential for serverless environments)
connectDB().then(async () => {
  console.log('✅ MongoDB connected');
  // Only seed the database in development or if specifically needed, 
  // to avoid slowing down serverless cold starts.
  if (process.env.NODE_ENV !== 'production') {
    await seedDatabase();
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Only start the server if the file is executed directly (e.g., node server.js)
// This ensures local development still works perfectly!
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Farahna server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
}
