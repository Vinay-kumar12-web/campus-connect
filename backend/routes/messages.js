const express = require('express');
const router = express.Router();
const { Message } = require('../models/Message');
const { protect } = require('../middleware/auth');

// Generate a consistent room ID for two users
const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

// @GET /api/messages/:userId — get chat history with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @POST /api/messages — save a message to DB
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const roomId = getRoomId(req.user._id.toString(), receiverId);

    const msg = await Message.create({
      roomId,
      sender: req.user._id,
      receiver: receiverId,
      text
    });

    await msg.populate('sender', 'name avatar');
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @GET /api/messages — get all conversations for current user
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 });

    // Get unique conversations (latest message per roomId)
    const seen = new Set();
    const conversations = messages.filter(m => {
      if (seen.has(m.roomId)) return false;
      seen.add(m.roomId);
      return true;
    });

    res.json(conversations);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
