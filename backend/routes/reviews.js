const express = require('express');
const router = express.Router();
const { Review } = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, revieweeId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Booking not completed yet.' });
    if (booking.reviewLeft) return res.status(400).json({ message: 'Review already submitted.' });

    const review = await Review.create({
      booking: bookingId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment
    });

    // Update reviewee's average rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avg.toFixed(1), totalReviews: allReviews.length });

    booking.reviewLeft = true;
    await booking.save();

    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @GET /api/reviews/user/:userId
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
