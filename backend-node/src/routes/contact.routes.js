const express = require('express');
const router = express.Router();
const { contactLimiter } = require('../middleware/rateLimiter');
const { validateContactPayload } = require('../middleware/validator');
const mailerService = require('../services/mailer.service');

/**
 * Route: POST /api/contact
 * Description: Validates, sanitizes, and dispatches portfolio contact inquiries.
 * Protection: Strict IP rate limiting (10 req / 15 min), XSS escaping, CRLF injection defense.
 */
router.post('/', contactLimiter, validateContactPayload, async (req, res, next) => {
  try {
    const { name, email, message, rawMessage } = req.sanitizedBody;

    // Send or simulate dispatch
    const result = await mailerService.sendContactNotification({
      name,
      email,
      message,
      rawMessage
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully. Thank you for reaching out.',
      data: {
        receivedAt: new Date().toISOString(),
        delivered: result.delivered,
        simulated: result.simulated || false
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
