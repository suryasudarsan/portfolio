const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { configureSecurityHeaders } = require('./middleware/securityHeaders');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route Handlers
const projectsRouter = require('./routes/projects.routes');
const contactRouter = require('./routes/contact.routes');
const securityRouter = require('./routes/security.routes');
const healthRouter = require('./routes/health.routes');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Trust first proxy hop if running behind Nginx / Cloudflare / Docker
app.set('trust proxy', 1);

// 1. Security Headers via Helmet & Custom Defense-in-Depth Middleware
app.use(configureSecurityHeaders());

// 2. Strict CORS Configuration
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, postman) or matching allowed list
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    const msg = `CORS Policy Block: The origin '${origin}' is not authorized to access this resource.`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours preflight caching
}));

// 3. Body Parsing with Strict Payload Size Limits (Mitigates Memory Exhaustion / DDoS)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// 4. Global API Rate Limiter
app.use('/api', apiLimiter);

// 5. Mount API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/health', healthRouter);
app.use('/api', securityRouter);

// 6. Optional: Serve frontend static files if frontend directory is placed alongside
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for root route if requested via browser
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.json({
        success: true,
        message: 'Cybersecurity Engineer Portfolio Backend is active and hardened.',
        endpoints: {
          projects: '/api/projects',
          contact: '/api/contact (POST)',
          certifications: '/api/certifications',
          skills: '/api/skills',
          pgp: '/api/pgp-key',
          stats: '/api/stats',
          health: '/api/health'
        }
      });
    }
  });
});

// 7. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Graceful Server Startup & Signal Trapping
const server = app.listen(PORT, () => {
  console.log(`
==========================================================
🛡️  CYBERSECURITY PORTFOLIO BACKEND (NODE.JS / EXPRESS)
==========================================================
 Status:      RUNNING & HARDENED
 Port:        ${PORT}
 Environment: ${process.env.NODE_ENV || 'development'}
 Base URL:    http://localhost:${PORT}
 Endpoints:
   • GET  /api/projects
   • POST /api/contact
   • GET  /api/certifications
   • GET  /api/skills
   • GET  /api/stats
   • GET  /api/pgp-key
   • GET  /api/health
==========================================================
  `);
});

// Handle termination signals securely
function gracefulShutdown(signal) {
  console.log(`\n[SECURITY] Received ${signal}. Closing HTTP connections safely...`);
  server.close(() => {
    console.log('[SECURITY] HTTP server closed cleanly. Exiting.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
