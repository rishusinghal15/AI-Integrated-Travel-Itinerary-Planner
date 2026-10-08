const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for authentication routes (login / register: 10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

// Rate limiter for AI operations: 10 attempts per 15 minutes per user (falling back to IP via ipKeyGenerator)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `user_${req.user._id.toString()}`;
    }
    return ipKeyGenerator(req);
  },
  message: {
    message: 'Rate limit exceeded: maximum 10 itinerary generations or replans per 15 minutes.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter
};
