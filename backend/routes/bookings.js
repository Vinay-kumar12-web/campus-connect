const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// @POST /api/bookings — create booking request
router.post('/', protect, async (req, res) => {
  try {
    const { listingId, startDate, endDate, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (!listing.isAvailable) return res.status(400).json({ message: 'Item not available.' });
    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own item.' });
    }

    // Check for date conflicts
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflict = listing.bookedDates.some(b => {
      return start < new Date(b.end) && end > new Date(b.start);
    });
    if (conflict) return res.status(400).json({ message: 'Item already booked for those dates.' });

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * listing.pricePerDay;

    const booking = await Booking.create({
      listing: listingId,
      borrower: req.user._id,
      owner: listing.owner,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice,
      message: message || ''
    });

    await booking.populate([
      { path: 'listing', select: 'title pricePerDay photos' },
      { path: 'borrower', select: 'name email avatar' },
      { path: 'owner', select: 'name email avatar' }
    ]);

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/bookings/my — my bookings (as borrower and owner)
router.get('/my', protect, async (req, res) => {
  try {
    const [sent, received] = await Promise.all([
      Booking.find({ borrower: req.user._id })
        .populate('listing', 'title photos pricePerDay')
        .populate('owner', 'name avatar')
        .sort({ createdAt: -1 }),
      Booking.find({ owner: req.user._id })
        .populate('listing', 'title photos pricePerDay')
        .populate('borrower', 'name avatar')
        .sort({ createdAt: -1 })
    ]);

    res.json({ sent, received });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PATCH /api/bookings/:id — accept/reject/complete/cancel
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Owner can accept/reject; borrower can cancel
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isBorrower = booking.borrower.toString() === req.user._id.toString();

    if (!isOwner && !isBorrower) return res.status(403).json({ message: 'Not authorized.' });
    if ((status === 'confirmed' || status === 'rejected') && !isOwner) {
      return res.status(403).json({ message: 'Only owner can accept or reject.' });
    }
    if (status === 'cancelled' && !isBorrower) {
      return res.status(403).json({ message: 'Only borrower can cancel.' });
    }

    booking.status = status;
    await booking.save();

    // If confirmed, block dates on listing
    if (status === 'confirmed') {
      await Listing.findByIdAndUpdate(booking.listing, {
        $push: {
          bookedDates: {
            start: booking.startDate,
            end: booking.endDate,
            bookingId: booking._id
          }
        }
      });
    }

    // If cancelled/rejected, unblock dates
    if (status === 'cancelled' || status === 'rejected') {
      await Listing.findByIdAndUpdate(booking.listing, {
        $pull: { bookedDates: { bookingId: booking._id } }
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
