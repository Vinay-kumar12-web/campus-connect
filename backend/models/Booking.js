const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: Number,
  totalPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  reviewLeft: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
