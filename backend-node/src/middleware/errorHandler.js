/**
 * Centralized Error Handling Middleware
 * Ensures zero sensitive information leakage (CWE-209 / OWASP A04:2021-Insecure Design).
 */
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log error internally (with correlation timestamp)
  const timestamp = new Date().toISOString();
  console.error(`[SECURITY ERROR LOG][${timestamp}] Path: ${req.originalUrl} | IP: ${req.ip}`);
  console.error(err.stack || err.message);

  // Payload Too Large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload size limit exceeded. Max 50KB allowed.'
    });
  }

  // SyntaxError from malformed JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload syntax.'
    });
  }

  // Generic 500 fallback
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: isDev ? err.message : 'An internal security exception occurred. Please contact the administrator.',
    timestamp
  });
}

/**
 * 404 Catch-All Middleware
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
