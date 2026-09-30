/**
 * Security & API Regression Test Suite
 * Built with native Node.js fetch & assert (Zero external testing dependencies required).
 */
const assert = require('assert');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`🛡️  RUNNING SECURITY & BACKEND REGRESSION TESTS`);
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Endpoint Test
  await test('GET /api/health returns OPERATIONAL status and active defense list', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200, 'Health endpoint should return status 200');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'OPERATIONAL');
    assert.ok(Array.isArray(data.activeDefenses), 'activeDefenses should be an array');
    assert.ok(data.activeDefenses.length >= 3, 'Must have at least 3 active defenses documented');
  });

  // 2. Hardened Security Headers Test
  await test('Security headers check (Helmet, nosniff, frameguard)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const headers = res.headers;
    
    // Check nosniff
    assert.strictEqual(headers.get('x-content-type-options'), 'nosniff', 'Missing X-Content-Type-Options: nosniff');
    // Check X-Frame-Options
    assert.strictEqual(headers.get('x-frame-options'), 'DENY', 'X-Frame-Options must be DENY');
    // Check custom posture header
    assert.strictEqual(headers.get('x-security-posture'), 'Hardened-L4', 'Missing X-Security-Posture header');
  });

  // 3. Projects Endpoint Test
  await test('GET /api/projects returns valid project list with tags and security details', async () => {
    const res = await fetch(`${BASE_URL}/api/projects`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data), 'Data should be an array');
    assert.ok(data.data.length > 0, 'Should return at least 1 project');
    
    const first = data.data[0];
    assert.ok(first.title, 'Project must have a title');
    assert.ok(first.description, 'Project must have a description');
    assert.ok(Array.isArray(first.tags), 'Project must have tags');
    assert.ok(first.github, 'Project must have a github link');
  });

  // 4. Contact Form Validation - Missing Fields (Negative Test)
  await test('POST /api/contact fails with 400 when fields are missing', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex' }) // missing email & message
    });
    assert.strictEqual(res.status, 400, 'Expected status 400 for incomplete payload');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('required'), 'Error message should indicate required fields');
  });

  // 5. Contact Form Validation - Invalid Email (Negative Test)
  await test('POST /api/contact fails with 400 for malformed email address', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker',
        email: 'invalid-email-address',
        message: 'Hello, this is a test message to verify email validation.'
      })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.toLowerCase().includes('email'), 'Error should mention email format');
  });

  // 6. Contact Form - Valid Submission & XSS Sanitization
  await test('POST /api/contact successfully accepts valid input and neutralizes XSS', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe <script>alert(1)</script>',
        email: 'jane.doe@cybersecurity.org',
        message: 'Interested in your enterprise security posture and pentest audit services.'
      })
    });
    assert.strictEqual(res.status, 200, 'Expected status 200 for valid payload');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.message.includes('successfully'), 'Should confirm successful dispatch');
  });

  // 7. Security Certifications Endpoint
  await test('GET /api/certifications returns certified credentials list', async () => {
    const res = await fetch(`${BASE_URL}/api/certifications`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  // 8. Public PGP Key Endpoint
  await test('GET /api/pgp-key returns ASCII Armored PGP Block', async () => {
    const res = await fetch(`${BASE_URL}/api/pgp-key`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('BEGIN PGP PUBLIC KEY BLOCK'), 'Should contain PGP public key header');
  });

  console.log(`\n------------------------------------------------------`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`------------------------------------------------------\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
