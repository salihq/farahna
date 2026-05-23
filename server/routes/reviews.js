const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

// All routes require auth
router.use(auth);

// ─── GET /:vendorId — Get reviews for a vendor ──────────────
router.get('/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.params.vendorId }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// ─── POST /:vendorId — Create review ────────────────────────
router.post('/:vendorId', async (req, res) => {
  try {
    const { reviewerName, rating, comment } = req.body;

    if (!reviewerName || rating === undefined) {
      return res.status(400).json({ error: 'اسم المُقيّم والتقييم مطلوبان' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 0 و 5' });
    }

    // Verify vendor exists
    const vendor = await User.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'المزوّد غير موجود' });
    }

    const review = await Review.create({
      vendorId: req.params.vendorId,
      reviewerName,
      rating,
      comment: comment || ''
    });

    // Recalculate vendor's average rating
    const allReviews = await Review.find({ vendorId: req.params.vendorId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(req.params.vendorId, {
      rating: Math.round(avgRating * 10) / 10
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

module.exports = router;
