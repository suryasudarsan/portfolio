# 🛡️ Cybersecurity Engineer Portfolio Backend Infra
A production-grade, dual-implementation backend system (**Node.js / Express** and **Python / Flask**) designed for a **Cybersecurity Engineer Portfolio & Security Operations Center (SOC)**.

This infrastructure is engineered with defense-in-depth principles: hardened HTTP response headers, strict CORS origin isolation, two-tier dynamic rate limiting (mitigating DDoS, reconnaissance scanning, and contact relay abuse), zero-trust input sanitization (XSS and SQLi/NoSQLi defense), and complete isolation of sensitive credentials via `.env` profiles.

---

## 📋 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Complete Command Reference](#-complete-command-reference)
3. [Quick Start Guide](#-quick-start-guide)
4. [API Specifications & Endpoints](#-api-specifications--endpoints)
5. [Security & Defensive Hardening](#-security--defensive-hardening)
6. [Security Audit & cURL Test Commands](#-security-audit--curl-test-commands)
7. [Frontend Integration](#-frontend-integration)
8. [Docker & Container Deployment](#-docker--container-deployment)
9. [Production Deployment Recommendations](#-production-deployment-recommendations)

---

## 🏛️ Architecture Overview

```
d:\projects\
├── backend-node\                  # Implementation A: Node.js (Express)
│   ├── src\
│   │   ├── server.js              # Server entry point, CORS, Body limits, Routing
│   │   ├── middleware\
│   │   │   ├── securityHeaders.js # Helmet, CSP, HSTS, X-Frame-Options, X-Content-Type-Options
│   │   │   ├── rateLimiter.js     # Tiered rate limiting (General API: 100/15m, Contact: 10/15m)
│   │   │   ├── validator.js       # XSS HTML escaping, RFC 5322 Email regex, NoSQL key blocker
│   │   │   └── errorHandler.js    # Safe error trapping with zero internal stack leakage
│   │   ├── services\
│   │   │   └── mailer.service.js  # Nodemailer with production SMTP & local audit simulator
│   │   ├── routes\                # /api/projects, /api/contact, /api/health, /api/security
│   │   └── data\                  # projects.json, skills.json, certifications.json
│   ├── tests\api.test.js          # Zero-dependency Node regression & security test suite
│   ├── package.json
│   ├── .env.example & .env
│   ├── Dockerfile
│   └── start.bat
│
├── backend-python\                # Implementation B: Python (Flask)
│   ├── app.py                     # Flask application factory, CORS, Rate limiting, Blueprints
│   ├── middleware\
│   │   ├── security_headers.py    # OWASP-compliant response header injection
│   │   └── sanitization.py        # Python XSS neutralization & CRLF injection filter
│   ├── routes\                    # Blueprints for projects, contact, security, health
│   ├── data\                      # Identical structured cybersecurity datasets
│   ├── test_api.py                # Standard library (urllib) test harness
│   ├── requirements.txt
│   ├── .env.example & .env
│   ├── Dockerfile
│   └── run.bat
│
├── frontend\                      # Interactive SOC / Portfolio Frontend
│   ├── index.html                 # Semantic HTML5, Matrix digital stream, Interactive API console
│   ├── style.css                  # Cyberpunk / SOC dark theme, glassmorphic panels
│   └── app.js                     # Implements loadProjects() and sendContactForm()
│
├── docker-compose.yml             # Dual container orchestration
├── setup.bat                      # One-click environment bootstrap
├── run_node.bat                   # Launches Node on port 5000 & opens browser
├── run_python.bat                 # Launches Flask on port 5001
└── test_all.bat                   # Runs automated regression tests
```

---

## ⚡ Complete Command Reference

All commands required to install, run, test, and containerize the applications:

### 1. Master Scripts (Windows)
```cmd
# Run one-click setup (installs npm dependencies and copies .env)
setup.bat

# Launch Node.js backend on http://localhost:5000 (serves APIs + frontend)
run_node.bat

# Launch Python Flask backend on http://localhost:5001
run_python.bat

# Run automated tests against both backends
test_all.bat
```

---

### 2. Node.js (Express) Commands

#### Install Dependencies:
```cmd
cd backend-node
npm install
```
*(On Windows systems where PowerShell script execution is restricted, invoke via npm.cmd:)*
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

#### Run in Development Mode (with live reload):
```cmd
cd backend-node
npm run dev
```

#### Run in Production Mode:
```cmd
cd backend-node
node src/server.js
```

#### Run Security & API Regression Tests:
```cmd
cd backend-node
npm test
```
*or directly with Node:*
```cmd
node backend-node/tests/api.test.js
```

---

### 3. Python (Flask) Commands

#### Setup Virtual Environment & Install Dependencies:
```cmd
cd backend-python
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On Linux / macOS:
source .venv/bin/activate

# Install requirements:
pip install -r requirements.txt
```

#### Run Development Server:
```cmd
cd backend-python
python app.py
```

#### Run via Production WSGI Server (Waitress on Windows):
```cmd
cd backend-python
waitress-serve --port=5001 app:app
```

#### Run via Gunicorn (Linux / Container):
```bash
gunicorn --bind 0.0.0.0:5001 app:app --workers 4
```

#### Run Regression Test Suite:
```cmd
cd backend-python
python test_api.py
```

---

### 4. Docker & Compose Commands

```bash
# Build and run both backends in isolated containers:
docker compose up --build

# Run in background (detached):
docker compose up -d

# Check running container health:
docker compose ps

# View container logs:
docker compose logs -f

# Tear down containers:
docker compose down
```

---

## 🚀 Quick Start Guide

### Step 1: Clone or Navigate to the Workspace
```cmd
cd d:\projects
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in both backend directories:
```cmd
copy backend-node\.env.example backend-node\.env
copy backend-python\.env.example backend-python\.env
```

### Step 3: Start Node.js Backend
Double click `run_node.bat` or run:
```cmd
cd backend-node
npm install
node src/server.js
```
The server will boot on **`http://localhost:5000`** and automatically serve the interactive portfolio frontend and the REST APIs.

### Step 4: (Optional) Start Python Flask Backend
Double click `run_python.bat` or run:
```cmd
cd backend-python
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
The Flask server will start on **`http://localhost:5001`**. The frontend includes a live switcher dropdown in the top telemetry bar allowing you to toggle between both backends seamlessly!

---

## 📡 API Specifications & Endpoints

### 1. Projects Data Endpoint
- **Route:** `GET /api/projects`
- **Description:** Returns dynamic data detailing cybersecurity projects, write-ups, and security tools.
- **Query Parameters (Optional):**
  - `tag` (e.g. `?tag=Python` or `?tag=Docker`)
  - `category` (e.g. `?category=Defensive`)
- **Status:** `200 OK`
- **Response Format:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "title": "Vulnerability Scanner & SIEM Log Analyzer",
      "description": "Automated network vulnerability assessment tool with log integration, threat scoring, and automated alerting pipeline.",
      "category": "Defensive Security",
      "tags": ["Python", "Docker", "ELK Stack", "Cybersecurity", "SIEM", "Nmap"],
      "github": "https://github.com/example/vulnerability-scanner",
      "metrics": {
        "cveCoverage": "14,000+ signatures",
        "scanLatency": "< 45s per subnet",
        "falsePositiveReduction": "38%"
      },
      "highlights": [
        "Asynchronous subnet port scanning & service banner fingerprinting",
        "Integration with Elasticsearch & Kibana dashboards for real-time alerting",
        "Rule-based CVE severity scoring based on CVSS v3.1 vectors"
      ]
    }
  ]
}
```

---

### 2. Single Project Write-Up
- **Route:** `GET /api/projects/:id`
- **Status:** `200 OK` (or `404 Not Found` if nonexistent)

---

### 3. Contact Form Submission
- **Route:** `POST /api/contact`
- **Rate Limits:** Strictly limited to **10 submissions per IP per 15 minutes** to prevent mail relay abuse and spam floods.
- **Request Headers:** `Content-Type: application/json`
- **Request Payload:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Interested in your security audit and vulnerability assessment services."
}
```
- **Validation Rules:**
  - `name`: String, 2 to 80 characters, sanitized against XSS.
  - `email`: Valid RFC 5322 format, CRLF sequences stripped.
  - `message`: String, 10 to 3,000 characters, HTML entities escaped.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Message sent successfully. Thank you for reaching out.",
  "data": {
    "receivedAt": "2026-09-30T06:15:00.000Z",
    "delivered": false,
    "simulated": true
  }
}
```
- **Error Response (`400 Bad Request`):**
```json
{
  "success": false,
  "error": "All fields are required. Name, email, and message cannot be empty."
}
```
- **Rate Limit Response (`429 Too Many Requests`):**
```json
{
  "success": false,
  "error": "Submission threshold exceeded: Too many contact requests. Please wait 15 minutes before retrying."
}
```

---

### 4. System Health & Security Telemetry
- **Route:** `GET /api/health`
- **Description:** Verifies runtime status, uptime, and lists active defensive controls.
- **Response Format (`200 OK`):**
```json
{
  "success": true,
  "status": "OPERATIONAL",
  "engine": "Node.js Express",
  "uptimeSeconds": 142,
  "activeDefenses": [
    "Helmet Security Headers (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff)",
    "Strict Dynamic CORS Origin Control",
    "Two-Tier Express Rate Limiting (General API & Contact Abuse Prevention)",
    "Input Sanitization (XSS escaping, RFC 5322 regex validation, NoSQL Injection prevention)",
    "Zero Token Leakage via .env Isolation"
  ]
}
```

---

### 5. Verified Credentials & Certifications
- **Route:** `GET /api/certifications`
- **Status:** `200 OK`
- **Returns:** Verified badges and IDs for OSCP, CISSP, AWS Security Specialty, CEH.

---

### 6. Technical Competencies Matrix
- **Route:** `GET /api/skills`
- **Status:** `200 OK`
- **Returns:** Categorized skills with proficiency scores across Defensive SOC, Offensive Pen-Testing, Cloud/DevSecOps, and Cryptography.

---

### 7. Public GPG/PGP Key
- **Route:** `GET /api/pgp-key`
- **Status:** `200 OK`
- **MIME:** `text/plain`
- **Returns:** ASCII armored public PGP key block for encrypted communications.

---

## 🔒 Security & Defensive Hardening

| Defensive Layer | Mechanism | Purpose |
| :--- | :--- | :--- |
| **HTTP Headers** | Helmet (Node) / Custom Filter (Python) | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`, `Permissions-Policy`. Prevents MIME-sniffing, clickjacking, and unauthorized browser API usage. |
| **CORS Control** | `cors` / `Flask-CORS` | Restricts access exclusively to authorized frontend origins configured in `.env`. Preflight `OPTIONS` requests are cached for 24 hours. |
| **Rate Limiting** | `express-rate-limit` / `Flask-Limiter` | Two tiers: Global API (100 req/15m) and Contact Endpoint (10 req/15m). Mitigates brute force, volumetric DDoS, and mail spam. |
| **Input Sanitization** | HTML entity encoder & regex | Escapes `< > " ' &` characters, neutralizes stored and reflected XSS. |
| **CRLF Injection Defense** | `\r\n` rejection on email fields | Blocks email header splitting and SMTP injection attacks. |
| **NoSQL / Object Defense** | Prototype & key recursion check | Rejects payloads containing `$` operators, `__proto__`, `constructor`, or `prototype` keys. |
| **Payload Limiting** | 50 KB ceiling (`express.json({ limit: '50kb' })`) | Defends against memory exhaustion attacks caused by massive JSON bodies. |
| **Zero Token Exposure** | `.env` separation | No API keys, passwords, or private keys in Git or client-facing bundles. |

---

## 🧪 Security Audit & cURL Test Commands

Use these cURL commands in your terminal to verify and audit the backend defenses:

### 1. Verify Project Retrieval
```bash
curl -i -X GET http://localhost:5000/api/projects
```

### 2. Verify Filter by Tag
```bash
curl -i -X GET "http://localhost:5000/api/projects?tag=ELK%20Stack"
```

### 3. Verify Hardened Security Headers
```bash
curl -i -X GET http://localhost:5000/api/health
```
*Expected headers in response:*
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `strict-transport-security: max-age=31536000; includeSubDomains; preload`
- `x-security-posture: Hardened-L4`

### 4. Test Valid Contact Form Submission
```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"message\":\"Inquiring about your penetration testing audit services.\"}"
```
*Expected:* `HTTP/1.1 200 OK` with `"success": true`.

### 5. Negative Test: Missing Fields Validation
```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Doe\"}"
```
*Expected:* `HTTP/1.1 400 Bad Request` with `"error": "All fields are required."`.

### 6. Negative Test: Malicious XSS Neutralization
```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"<script>alert('xss')</script>\",\"email\":\"pentest@example.com\",\"message\":\"Testing XSS sanitization routine.\"}"
```
*Expected:* `HTTP/1.1 200 OK` with payload safely escaped in server audit logs.

### 7. Negative Test: CRLF Header Injection Defense
```bash
curl -i -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Attacker\r\nBcc: victim@target.com\",\"email\":\"attacker@example.com\",\"message\":\"Testing CRLF header injection.\"}"
```
*Expected:* `HTTP/1.1 400 Bad Request` with `"error": "Malicious input detected: CRLF injection in header fields."`.

### 8. Negative Test: Rate Limiting Abuse
Run 12 consecutive submissions to trigger the `429 Too Many Requests` limiter:
```powershell
1..12 | ForEach-Object {
    curl.exe -s -o /dev/null -w "%{http_code}`n" -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" -d '{"name":"Bot","email":"bot@spam.com","message":"Spam payload iteration test."}'
}
```
*Expected:* The first 10 requests return `200`, and requests 11+ return `429`.

---

## 💻 Frontend Integration

The portfolio frontend in `frontend/` interfaces directly with the backend endpoints using the recommended integration pattern:

```javascript
// Fetch Projects Example
async function loadProjects() {
  try {
    const response = await fetch('http://localhost:5000/api/projects');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

// Submit Contact Form Example
async function sendContactForm(formData) {
  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
  }
}
```

### Frontend Highlights:
- **Interactive SOC Live Console:** Inspect headers, latency, and JSON payloads directly inside the browser.
- **Live Backend Switcher:** Toggle dynamically between Node.js (:5000) and Python Flask (:5001).
- **Matrix Digital Rain:** Ambient canvas animation styled with a high-tech cybersecurity theme.
- **PGP Key Exporter:** Instant copy or download of `.asc` armored cryptographic public keys.

---

## 🐳 Docker & Container Deployment

To launch the entire dual-backend suite in isolated Docker containers:

```bash
docker compose up -d
```

- **Node.js Express Backend:** Available at `http://localhost:5000`
- **Python Flask Backend:** Available at `http://localhost:5001`
- **Security flags enabled:** `read_only: true`, `no-new-privileges: true`, non-root execution.

---

## 🌐 Production Deployment Recommendations

When deploying to production (e.g. AWS EC2, DigitalOcean, or Linode):

1. **Reverse Proxy (Nginx):**
   Terminate TLS/SSL at Nginx and reverse proxy to the application:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name portfolio.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/portfolio.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/portfolio.yourdomain.com/privkey.pem;

       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           root /var/www/portfolio/frontend;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

2. **Process Management (PM2 for Node.js):**
   ```bash
   npm install -g pm2
   pm2 start backend-node/src/server.js --name "cyber-portfolio-node" -i max
   pm2 save
   ```

3. **Production WSGI (Gunicorn for Python Flask):**
   ```bash
   gunicorn --workers 4 --bind 127.0.0.1:5001 app:app
   ```

---

## ⚖️ Safety & Ethical Compliance

All tools, scripts, and endpoints in this repository are strictly engineered for **administrative, defensive security engineering, educational research, and portfolio demonstration purposes**. No malicious exploits or weaponized payloads are distributed or maintained.
