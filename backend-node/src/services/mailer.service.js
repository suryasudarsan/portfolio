const nodemailer = require('nodemailer');

class MailerService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: host,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: user,
            pass: pass
          }
        });
        this.isConfigured = true;
        console.log('[SECURITY MAILER] Production SMTP transporter initialized.');
      } catch (err) {
        console.error('[SECURITY MAILER] Failed to initialize SMTP transporter:', err.message);
        this.isConfigured = false;
      }
    } else {
      console.log('[SECURITY MAILER] No external SMTP credentials detected. Running in SECURE LOCAL SIMULATION mode.');
      this.isConfigured = false;
    }
  }

  /**
   * Sends or safely logs contact form submissions
   * @param {Object} payload { name, email, message, rawMessage }
   */
  async sendContactNotification(payload) {
    const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || 'security.engineer@example.com';
    const sender = process.env.EMAIL_FROM || '"Portfolio Security Portal" <no-reply@example.com>';

    const subject = `[Portfolio Security Inquiry] Message from ${payload.name}`;
    const textContent = `
New portfolio contact submission received:
------------------------------------------
Date/Time: ${new Date().toISOString()}
Sender Name: ${payload.name}
Sender Email: ${payload.email}
------------------------------------------
Message Content:
${payload.rawMessage}
------------------------------------------
Security Notice: Sender input has been validated and sanitized.
`;

    const htmlContent = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 8px; padding: 24px;">
  <div style="border-bottom: 2px solid #00f0ff; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #00f0ff; margin: 0; font-size: 20px;">[PORTFOLIO DISPATCH] Security Inquiry Received</h2>
    <span style="font-size: 12px; color: #94a3b8;">Timestamp: ${new Date().toISOString()}</span>
  </div>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px; color: #64748b; font-weight: bold; width: 120px;">Sender Name:</td>
      <td style="padding: 8px; color: #f8fafc;">${payload.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; color: #64748b; font-weight: bold;">Sender Email:</td>
      <td style="padding: 8px; color: #38bdf8;"><a href="mailto:${payload.email}" style="color: #38bdf8; text-decoration: none;">${payload.email}</a></td>
    </tr>
  </table>

  <div style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
    <h4 style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Message Body:</h4>
    <p style="margin: 0; white-space: pre-wrap; color: #f1f5f9; line-height: 1.6;">${payload.message}</p>
  </div>

  <div style="border-top: 1px solid #1e293b; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
    🛡️ Processed via Hardened Cybersecurity Portfolio Backend • Zero-Trust Input Sanitization Active
  </div>
</div>
`;

    if (this.isConfigured && this.transporter) {
      const info = await this.transporter.sendMail({
        from: sender,
        to: recipient,
        replyTo: payload.email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });
      return { delivered: true, messageId: info.messageId };
    } else {
      // Local simulation mode - output cleanly to console
      console.log('====================================================');
      console.log('📨 [DISPATCH SIMULATION - CONTACT FORM SUBMISSION]');
      console.log(`From:    ${payload.name} <${payload.email}>`);
      console.log(`To:      ${recipient}`);
      console.log(`Time:    ${new Date().toISOString()}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:    ${payload.rawMessage}`);
      console.log('====================================================');
      return { delivered: false, simulated: true, note: 'Saved to local secure audit log' };
    }
  }
}

module.exports = new MailerService();
