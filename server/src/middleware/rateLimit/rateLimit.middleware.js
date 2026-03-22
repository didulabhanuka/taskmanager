const rateLimit = require('express-rate-limit');

// General API limit — applied to all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after 15 minutes',
  },
});


// Stricter limit for auth routes — prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

module.exports = { apiLimiter, authLimiter };