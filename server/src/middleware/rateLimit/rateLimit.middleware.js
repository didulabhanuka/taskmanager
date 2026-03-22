const rateLimit = require('express-rate-limit');

// General API limit — applied to all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs per IP
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after 15 minutes',
  },
});

// Stricter limit for auth routes — prevents brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login/register attempts per windowMs per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

module.exports = { apiLimiter, authLimiter };