// src/middleware/rateLimiter.js
// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// General API rate limiter — 100 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
        },
    },
});

// Strict limiter for auth endpoints — 50 attempts per 15 minutes (relaxed for dev)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again in 15 minutes.',
        },
    },
});

module.exports = { apiLimiter, authLimiter };
