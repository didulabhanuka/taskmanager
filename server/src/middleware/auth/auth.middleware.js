const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const protect = async (req, res, next) => {
  try {
    // Check if token exists in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token — throws if expired or invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request
    // We use select('-passwordHash') as an extra safety measure
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired, please log in again' });
    }
    next(err);
  }
};

module.exports = { protect };