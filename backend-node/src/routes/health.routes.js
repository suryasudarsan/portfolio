const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * Route: GET /api/health
 * Description: Health check and security posture assessment endpoint
 */
router.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    success: true,
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    engine: 'Node.js Express',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(),
      release: os.release(),
      totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
      heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024))
    },
    activeDefenses: [
      'Helmet Security Headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff)',
      'Strict Dynamic CORS Origin Control',
      'Two-Tier Express Rate Limiting (General API & Contact Abuse Prevention)',
      'Input Sanitization (XSS escaping, RFC 5322 regex validation, NoSQL Injection prevention)',
      'Zero Token Leakage via .env Isolation'
    ]
  });
});

module.exports = router;
