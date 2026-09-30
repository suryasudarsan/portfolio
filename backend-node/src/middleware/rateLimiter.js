const rateLimit = require('express-rate-limit');

/**
 * Standard API Rate Limiter
 * Applied across general public API routes to mitigate reconnaissance scanning & DDoS.
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  statusCode: 429,
  message: {
    success: false,
    error: 'Rate limit exceeded: Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Strict Contact Form Limiter
 * Applied specifically to POST /api/contact to prevent email spam, automated bots, and abuse.
 */
const contactLimiter = rateLimit({
  windowMs: parseInt(process.env.CONTACT_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.CONTACT_LIMIT_MAX || '10', 10), // 10 submissions per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    error: 'Submission threshold exceeded: Too many contact requests. Please wait 15 minutes before retrying.'
  }
});

module.exports = {
  apiLimiter,
  contactLimiter
};
