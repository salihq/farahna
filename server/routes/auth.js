const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ─── POST /login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    }

    const token = generateToken(user._id);

    const userObj = user.toJSON();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /me ─────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const userObj = req.user.toJSON();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
