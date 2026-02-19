const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect } = require('../middleware/auth');

// @GET /api/listings — get all listings with search/filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, available } = req.query;
    let query = {};

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (available === 'true') query.isAvailable = true;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query)
      .populate('owner', 'name email avatar rating')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/listings/:id — single listing
router.get('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email avatar rating phone totalReviews');

    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/listings — create listing
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, pricePerDay, photos, location, condition } = req.body;

    const listing = await Listing.create({
      owner: req.user._id,
      title,
      description,
      category,
      pricePerDay,
      photos: photos || [],
      location,
      condition
    });

    await listing.populate('owner', 'name email avatar rating');
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/listings/:id — update listing (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner', 'name email avatar rating');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/listings/:id — delete listing (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/listings/user/my — my listings
router.get('/user/my', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
