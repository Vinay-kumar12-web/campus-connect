const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, listings, bookings, events] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Event.countDocuments()
    ]);
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    res.json({ users, listings, bookings, events, activeBookings });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @PATCH /api/admin/users/:id — change role
router.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @GET /api/admin/listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @DELETE /api/admin/listings/:id
router.delete('/listings/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
