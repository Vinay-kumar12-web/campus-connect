const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student'
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
