// ═══════════════════════════════════════════════════════════════
// Security Middleware Stack
// ═══════════════════════════════════════════════════════════════

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

function applySecurity(app) {
  // ─── Helmet (HTTP Security Headers) ──────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // ─── CORS ────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN || true  // Same-origin in production
      : true,
    credentials: true
  }));

  // ─── Rate Limiting (General) ─────────────────────────────
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 200,                  // 200 requests per window
    message: { error: 'تجاوزت الحد المسموح من الطلبات. حاول مجدداً بعد قليل.' },
    standardHeaders: true,
    legacyHeaders: false
  }));

  // ─── Rate Limiting (Login — stricter) ────────────────────
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,                   // 10 login attempts per 15 min
    message: { error: 'محاولات دخول كثيرة. حاول مجدداً بعد 15 دقيقة.' },
    standardHeaders: true,
    legacyHeaders: false
  }));

  // ─── NoSQL Injection Prevention ──────────────────────────
  app.use(mongoSanitize({
    replaceWith: '_'
  }));

  // ─── HTTP Parameter Pollution Protection ─────────────────
  app.use(hpp());
}

module.exports = { applySecurity };
