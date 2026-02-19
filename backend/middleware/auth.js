const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — require valid JWT
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. Please login.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found.' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

// Require admin role
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

// Require organizer or admin
exports.organizerOrAdmin = (req, res, next) => {
  if (!['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Organizer access required.' });
  }
  next();
};
