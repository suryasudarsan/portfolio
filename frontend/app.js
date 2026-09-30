/**
 * ============================================================================
 * Cybersecurity Engineer Portfolio - Frontend Integration & SOC Logic
 * Implements Frontend Integration Guidelines & Hardened Security Handlers
 * ============================================================================
 */

// Active Backend Base URL (Auto-detected from current origin or default to 5000)
let currentBackendUrl = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http'))
  ? window.location.origin
  : 'http://localhost:5000';

// Global cache for projects to support client-side fast filtering
let cachedProjects = [];

// ============================================================================
// 1. Core Integration Functions (As specified in Backend Requirements)
// ============================================================================

/**
 * Fetch Projects Example (as required by system prompt)
 */
async function loadProjects() {
  try {
    const response = await fetch(`${currentBackendUrl}/api/projects`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

/**
 * Submit Contact Form Example (as required by system prompt)
 */
async function sendContactForm(formData) {
  try {
    const response = await fetch(`${currentBackendUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. Additional Specialized Data Fetchers
// ============================================================================

async function loadCertifications() {
  try {
    const res = await fetch(`${currentBackendUrl}/api/certifications`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching certifications:', err);
    return [];
  }
}

async function loadSkills() {
  try {
    const res = await fetch(`${currentBackendUrl}/api/skills`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching skills:', err);
    return [];
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${currentBackendUrl}/api/stats`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('Could not load dynamic stats:', err);
    return null;
  }
}

async function loadPgpKey() {
  try {
    const res = await fetch(`${currentBackendUrl}/api/pgp-key`);
    return await res.text();
  } catch (err) {
    return 'Failed to load PGP key from backend: ' + err.message;
  }
}

// ============================================================================
// 3. UI Rendering Engines
// ============================================================================

function renderProjects(projectsList) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  if (!projectsList || projectsList.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <span>No matching security tooling or research projects found.</span>
      </div>`;
    return;
  }

  container.innerHTML = projectsList.map(project => `
    <article class="project-card" data-id="${project.id}">
      <div>
        <span class="project-category">${project.category || 'DEFENSIVE SECURITY'}</span>
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-desc">${escapeHtml(project.description)}</p>
        
        <div class="project-tags">
          ${(project.tags || []).map(t => `<span class="tag-badge">${escapeHtml(t)}</span>`).join('')}
        </div>

        ${project.metrics ? `
          <div class="project-metrics">
            ${Object.entries(project.metrics).map(([k, v]) => `
              <div class="metric-row">
                <span class="metric-key">${formatMetricKey(k)}:</span>
                <span class="metric-val">${escapeHtml(v)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="project-footer">
        <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer" class="project-link">
          <span>SOURCE REPO</span>
          <span>→</span>
        </a>
        <span class="cert-status">CVE AUDITED</span>
      </div>
    </article>
  `).join('');
}

function renderCertifications(certs) {
  const container = document.getElementById('certifications-grid');
  if (!container) return;

  if (!certs || certs.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <span>No certification data returned from ${currentBackendUrl}/api/certifications</span>
      </div>`;
    return;
  }

  container.innerHTML = certs.map(cert => `
    <div class="cert-card">
      <div class="cert-badge-fallback">🛡️</div>
      <div>
        <div class="cert-code">${escapeHtml(cert.code)}</div>
        <div class="cert-name">${escapeHtml(cert.name)}</div>
        <div class="cert-issuer">Issuer: ${escapeHtml(cert.issuer)}</div>
        <span class="cert-status">ID: ${escapeHtml(cert.verificationId || 'VERIFIED')}</span>
      </div>
    </div>
  `).join('');
}

function renderSkills(domains) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  if (!domains || domains.length === 0) {
    container.innerHTML = `<div class="loading-state"><span>No skills data available.</span></div>`;
    return;
  }

  container.innerHTML = domains.map(domain => `
    <div class="skill-domain-card">
      <div class="skill-domain-header">
        <h3 class="skill-domain-title">${escapeHtml(domain.name)}</h3>
        <span class="skill-proficiency-val">${domain.proficiency || 90}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${domain.proficiency || 90}%"></div>
      </div>
      <div class="skill-items-list">
        ${(domain.skills || []).map(skill => `
          <span class="skill-pill">${escapeHtml(skill)}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function updateStats(stats) {
  if (!stats) return;
  if (stats.threatsNeutralized) {
    document.getElementById('stat-threats').textContent = stats.threatsNeutralized.toLocaleString() + '+';
  }
  if (stats.vulnerabilitiesRemediated) {
    document.getElementById('stat-vulns').textContent = stats.vulnerabilitiesRemediated.toLocaleString() + '+';
  }
  if (stats.systemsHardened) {
    document.getElementById('stat-systems').textContent = stats.systemsHardened.toLocaleString() + '+';
  }
  if (stats.uptimeReliability) {
    document.getElementById('stat-uptime').textContent = stats.uptimeReliability;
  }
}

// ============================================================================
// 4. Contact Form Handler (Rate limit feedback & Sanitization check)
// ============================================================================

function initContactForm() {
  const form = document.getElementById('contact-form');
  const messageInput = document.getElementById('message');
  const charCount = document.getElementById('char-count');
  const feedbackBox = document.getElementById('contact-feedback');
  const submitBtn = document.getElementById('btn-submit-contact');
  const spinner = document.getElementById('submit-spinner');
  const btnText = document.getElementById('submit-btn-text');

  if (!form) return;

  // Real-time character counter
  messageInput.addEventListener('input', () => {
    const len = messageInput.value.length;
    charCount.textContent = `${len} / 3000`;
    if (len > 3000) {
      charCount.style.color = '#ef4444';
    } else {
      charCount.style.color = 'var(--text-dim)';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check honeypot field
    const honeypot = form.elements['website_url']?.value;
    if (honeypot) {
      showFeedback('Access Denied: Automated bot activity detected.', 'error');
      return;
    }

    const name = form.elements['name']?.value?.trim();
    const email = form.elements['email']?.value?.trim();
    const message = form.elements['message']?.value?.trim();

    // Client-side pre-validation
    if (!name || !email || !message) {
      showFeedback('Validation Error: All fields (name, email, message) are required.', 'error');
      return;
    }

    if (message.length < 10) {
      showFeedback('Validation Error: Message must contain at least 10 characters.', 'error');
      return;
    }

    // Set UI to loading state
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'DISPATCHING TO SECURE BACKEND...';
    hideFeedback();

    const payload = { name, email, message };

    try {
      const startTime = performance.now();
      const result = await sendContactForm(payload);
      const latency = Math.round(performance.now() - startTime);

      if (result && result.success) {
        showFeedback(`✓ Message dispatched successfully (${latency}ms)! Check server console for secure audit log.`, 'success');
        form.reset();
        charCount.textContent = '0 / 3000';
      } else {
        const errorMsg = result?.error || 'Failed to dispatch message to backend.';
        showFeedback(`❌ Dispatch Error: ${errorMsg}`, 'error');
      }
    } catch (err) {
      showFeedback(`Network Failure: Could not reach backend at ${currentBackendUrl}. Ensure server is running.`, 'error');
    } finally {
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      btnText.textContent = 'DISPATCH MESSAGE VIA SECURE API';
    }
  });

  function showFeedback(msg, type) {
    feedbackBox.className = `feedback-box ${type}`;
    feedbackBox.textContent = msg;
    feedbackBox.classList.remove('hidden');
  }

  function hideFeedback() {
    feedbackBox.classList.add('hidden');
  }
}

// ============================================================================
// 5. Live Interactive API Console / Test Bench
// ============================================================================

function initApiConsole() {
  const buttons = document.querySelectorAll('.btn-api');
  const outputEl = document.getElementById('console-output-text');
  const statusEl = document.getElementById('console-status');
  const latencyEl = document.getElementById('console-latency');
  const headersEl = document.getElementById('console-headers-summary');

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const endpoint = btn.getAttribute('data-endpoint');
      const method = btn.getAttribute('data-method') || 'GET';
      const targetUrl = `${currentBackendUrl}${endpoint}`;

      outputEl.textContent = `// Executing ${method} ${targetUrl} ...`;
      statusEl.textContent = 'PENDING...';
      statusEl.style.color = 'var(--text-muted)';
      latencyEl.textContent = '-- ms';

      const t0 = performance.now();
      try {
        const response = await fetch(targetUrl, { method });
        const latency = Math.round(performance.now() - t0);
        latencyEl.textContent = `${latency} ms`;

        statusEl.textContent = `${response.status} ${response.statusText}`;
        statusEl.style.color = response.ok ? 'var(--accent-emerald)' : 'var(--accent-crimson)';

        // Extract key security headers
        const securityHeaders = [];
        ['x-content-type-options', 'x-frame-options', 'x-security-posture', 'strict-transport-security', 'content-security-policy'].forEach(h => {
          if (response.headers.get(h)) securityHeaders.push(h);
        });
        headersEl.textContent = securityHeaders.length > 0 ? securityHeaders.join(', ') : 'Standard headers';

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          outputEl.textContent = JSON.stringify(data, null, 2);
        } else {
          const text = await response.text();
          outputEl.textContent = text;
        }
      } catch (err) {
        statusEl.textContent = 'ERR_CONNECTION_REFUSED';
        statusEl.style.color = 'var(--accent-crimson)';
        outputEl.textContent = `// Connection failed: ${err.message}\n// Ensure server is active at ${currentBackendUrl}`;
      }
    });
  });
}

// ============================================================================
// 6. Backend Engine Switcher & Health Ping
// ============================================================================

function initBackendSwitcher() {
  const select = document.getElementById('engine-select');
  const label = document.getElementById('active-engine-label');
  const pingBtn = document.getElementById('btn-ping-backend');
  const statusDot = document.getElementById('telemetry-dot');
  const urlDisplay = document.getElementById('current-url-display');

  // Sync initial select dropdown & label with auto-detected backend
  if (select) {
    const matchingOption = Array.from(select.options).find(opt => opt.value === currentBackendUrl);
    if (matchingOption) {
      select.value = currentBackendUrl;
      if (label) label.textContent = matchingOption.text;
    } else if (label) {
      label.textContent = currentBackendUrl;
    }
  }
  if (urlDisplay) urlDisplay.textContent = currentBackendUrl;

  async function checkBackendHealth() {
    try {
      const res = await fetch(`${currentBackendUrl}/api/health`);
      if (res.ok) {
        statusDot.className = 'status-dot green pulse';
        return true;
      }
    } catch (_) {}
    statusDot.className = 'status-dot red pulse';
    return false;
  }

  select.addEventListener('change', async () => {
    if (select.value === 'custom') {
      const custom = prompt('Enter custom backend URL (e.g. http://localhost:8080):', currentBackendUrl);
      if (custom) {
        currentBackendUrl = custom.replace(/\/$/, '');
      } else {
        select.value = currentBackendUrl;
        return;
      }
    } else {
      currentBackendUrl = select.value;
    }

    urlDisplay.textContent = currentBackendUrl;
    label.textContent = select.options[select.selectedIndex]?.text || currentBackendUrl;

    // Refresh all dynamic sections
    await bootstrapAllData();
    await checkBackendHealth();
  });

  pingBtn.addEventListener('click', async () => {
    pingBtn.textContent = 'PINGING...';
    const isUp = await checkBackendHealth();
    pingBtn.textContent = isUp ? 'ONLINE ✓' : 'OFFLINE ✗';
    setTimeout(() => { pingBtn.textContent = 'PING'; }, 2000);
  });

  // Initial ping
  checkBackendHealth();
}

// ============================================================================
// 7. PGP Modal Controls
// ============================================================================

function initPgpModal() {
  const showBtn = document.getElementById('btn-show-pgp');
  const modal = document.getElementById('pgp-modal');
  const closeBtn = document.getElementById('btn-close-pgp');
  const copyBtn = document.getElementById('btn-copy-pgp');
  const downloadBtn = document.getElementById('btn-download-pgp');
  const keyTextEl = document.getElementById('pgp-key-text');

  if (!modal) return;

  showBtn?.addEventListener('click', async () => {
    modal.classList.remove('hidden');
    keyTextEl.textContent = 'Fetching PGP key from backend...';
    const key = await loadPgpKey();
    keyTextEl.textContent = key;
  });

  closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  copyBtn?.addEventListener('click', async () => {
    const text = keyTextEl.textContent;
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'COPIED ✓';
    setTimeout(() => { copyBtn.textContent = 'COPY KEY BLOCK'; }, 2000);
  });

  downloadBtn?.addEventListener('click', () => {
    const text = keyTextEl.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cybersecurity_engineer_public_key.asc';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ============================================================================
// 8. Tag Filtering
// ============================================================================

function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');
      if (filter === 'all') {
        renderProjects(cachedProjects);
      } else {
        const filtered = cachedProjects.filter(p =>
          (p.tags || []).some(t => t.toLowerCase().includes(filter.toLowerCase())) ||
          (p.category || '').toLowerCase().includes(filter.toLowerCase())
        );
        renderProjects(filtered);
      }
    });
  });
}

// ============================================================================
// 9. Matrix Rain Ambient Canvas Effect
// ============================================================================

function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const chars = '01ABCDEF489XYZ<>{}[]!@#$%^&*~+=/|';
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(6, 9, 14, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f0ff';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
}

// ============================================================================
// 10. Bootstrap Application Data
// ============================================================================

async function bootstrapAllData() {
  // 1. Projects
  const projects = await loadProjects();
  if (projects) {
    cachedProjects = projects;
    renderProjects(projects);
  }

  // 2. Certifications
  const certs = await loadCertifications();
  renderCertifications(certs);

  // 3. Skills
  const skills = await loadSkills();
  renderSkills(skills);

  // 4. Stats
  const stats = await loadStats();
  updateStats(stats);
}

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMetricKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initBackendSwitcher();
  initContactForm();
  initApiConsole();
  initPgpModal();
  initFilters();

  // Load initial backend dynamic data
  bootstrapAllData();
});
