const helmet = require('helmet');

/**
 * Enhanced Security Headers Middleware
 * Configures Helmet and hardened HTTP response headers for defensive cybersecurity posture.
 */
function configureSecurityHeaders() {
  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    dnsPrefetchControl: { allow: false }
  });

  return (req, res, next) => {
    helmetMiddleware(req, res, () => {
      // Additional Defense-in-Depth headers
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
      res.setHeader('X-Security-Posture', 'Hardened-L4');
      next();
    });
  };
}

module.exports = { configureSecurityHeaders };
