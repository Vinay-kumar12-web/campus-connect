const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['books', 'electronics', 'sports', 'clothing', 'stationery', 'musical', 'other'],
    default: 'other'
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: 1
  },
  photos: [String],
  location: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bookedDates: [{
    start: Date,
    end: Date,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  }],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Text search index
listingSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
