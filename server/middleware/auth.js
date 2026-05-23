// ═══════════════════════════════════════════════════════════════
// JWT Authentication Middleware
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'غير مصرح — يرجى تسجيل الدخول' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'انتهت صلاحية الجلسة — أعد تسجيل الدخول' });
    }
    return res.status(401).json({ error: 'رمز المصادقة غير صالح' });
  }
}

// Role-based access control
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
    }
    next();
  };
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

module.exports = { auth, requireRole, generateToken };
