// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, organizerOrAdmin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;

    const events = await Event.find(query)
      .populate('organizer', 'name avatar')
      .sort({ dateTime: 1 });
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar email')
      .populate('interested', 'name avatar');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    await event.populate('organizer', 'name avatar');
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/interested', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const idx = event.interested.indexOf(req.user._id);
    if (idx === -1) {
      event.interested.push(req.user._id);
    } else {
      event.interested.splice(idx, 1);
    }
    await event.save();
    res.json({ interested: event.interested, count: event.interested.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
