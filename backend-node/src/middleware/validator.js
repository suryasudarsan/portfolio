/**
 * Input Validation & Sanitization Middleware
 * Defense against Cross-Site Scripting (XSS), SQLi/NoSQLi, Header Injection, and Parameter Pollution.
 */

// Simple, robust HTML escaping function for XSS neutralization
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// RFC 5322 Compliant Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Detection for dangerous NoSQL or prototype injection keys
function hasForbiddenKeys(obj) {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (typeof obj[key] === 'object' && hasForbiddenKeys(obj[key])) {
      return true;
    }
  }
  return false;
}

/**
 * Validates and sanitizes the /api/contact POST payload
 */
function validateContactPayload(req, res, next) {
  const body = req.body;

  // 1. Guard against non-object or null bodies
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payload format. Expected JSON object.'
    });
  }

  // 2. Guard against NoSQL operator injection and prototype pollution
  if (hasForbiddenKeys(body)) {
    return res.status(400).json({
      success: false,
      error: 'Security violation: Suspicious operators or reserved keys detected.'
    });
  }

  // 3. Extract and check raw fields
  const rawName = body.name;
  const rawEmail = body.email;
  const rawMessage = body.message;

  if (
    typeof rawName !== 'string' ||
    typeof rawEmail !== 'string' ||
    typeof rawMessage !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      error: 'All fields (name, email, message) are required and must be strings.'
    });
  }

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();
  const message = rawMessage.trim();

  // 4. Presence validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required. Name, email, and message cannot be empty.'
    });
  }

  // 5. Length constraints
  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      success: false,
      error: 'Name must be between 2 and 80 characters.'
    });
  }

  if (email.length < 5 || email.length > 120 || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address format.'
    });
  }

  // Protect against header injection / CRLF injection in email fields
  if (/[\r\n]/.test(email) || /[\r\n]/.test(name)) {
    return res.status(400).json({
      success: false,
      error: 'Malicious input detected: CRLF injection in header fields.'
    });
  }

  if (message.length < 10 || message.length > 3000) {
    return res.status(400).json({
      success: false,
      error: 'Message must be between 10 and 3,000 characters.'
    });
  }

  // 6. Bot honeypot check (optional anti-spam field)
  if (body.website_url || body._gotcha) {
    // Silently succeed or reject bots
    return res.status(200).json({
      success: true,
      message: 'Message processed.'
    });
  }

  // 7. Sanitize and store cleaned payload on req.sanitizedBody
  req.sanitizedBody = {
    name: escapeHtml(name),
    email: email, // Validated against email regex
    message: escapeHtml(message),
    rawMessage: message.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Stripped control chars
  };

  next();
}

module.exports = {
  validateContactPayload,
  escapeHtml
};
