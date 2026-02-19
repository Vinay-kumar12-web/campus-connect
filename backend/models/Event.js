const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['lecture', 'workshop', 'fest', 'sports', 'cultural', 'tech', 'other'],
    default: 'other'
  },
  dateTime: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  interested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxAttendees: {
    type: Number,
    default: 0  // 0 = unlimited
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
