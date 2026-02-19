const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate JWT token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;

    // Validate college email domain
    const collegeDomain = process.env.COLLEGE_DOMAIN || 'college.edu';
    if (!email.endsWith(`@${collegeDomain}`)) {
      return res.status(400).json({
        message: `Only ${collegeDomain} email addresses are allowed.`
      });
    }

    // Check if already registered
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      year
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        rating: user.rating
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/auth/me — get current user
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
