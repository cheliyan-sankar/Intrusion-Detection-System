<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attack Simulator - DemoKart</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2874f0;
      --primary-dark: #1e5bb8;
      --secondary: #fb641b;
      --success: #388e3c;
      --warning: #f57c00;
      --error: #d32f2f;
      --text: #212121;
      --text-light: #666;
      --bg: #f5f5f5;
      --white: #ffffff;
      --border: #e0e0e0;
      --shadow: 0 2px 8px rgba(0,0,0,0.1);
      --shadow-lg: 0 4px 16px rgba(0,0,0,0.15);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
      background: var(--white);
      border-radius: 12px;
      box-shadow: var(--shadow);
    }

    .header h1 {
      color: var(--primary);
      margin-bottom: 10px;
      font-size: 2.5rem;
    }

    .header p {
      color: var(--text-light);
      font-size: 1.1rem;
    }

    .login-panel, .stimulator-panel {
      background: var(--white);
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: 30px;
      margin-bottom: 30px;
    }

    .login-panel {
      max-width: 400px;
      margin: 50px auto;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text);
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: var(--primary);
      color: var(--white);
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: var(--white);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      color: var(--error);
      font-size: 14px;
      margin-top: 8px;
    }

    .hidden {
      display: none !important;
    }

    .stimulator-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .control-group {
      background: var(--bg);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .control-group h3 {
      margin-bottom: 15px;
      color: var(--primary);
      font-size: 1.2rem;
    }

    .control-input {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .control-input label {
      min-width: 120px;
      font-weight: 500;
    }

    .control-input input[type="number"] {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 4px;
    }

    .control-input input[type="range"] {
      flex: 1;
    }

    .control-input .value {
      min-width: 40px;
      text-align: center;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: var(--bg);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--border);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 5px;
    }

    .stat-label {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      width: 0%;
      transition: width 0.3s ease;
    }

    .log-area {
      background: #f8f9fa;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 15px;
      height: 300px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
    }

    .log-entry {
      margin-bottom: 5px;
      padding: 2px 0;
    }

    .log-entry.success { color: var(--success); }
    .log-entry.info { color: var(--primary); }
    .log-entry.warning { color: var(--warning); }
    .log-entry.error { color: var(--error); }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .attack-mode {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
    }

    .attack-mode .header h1 {
      color: #ff4757;
    }

    .attack-mode .btn-primary {
      background: #ff4757;
    }

    .attack-mode .btn-primary:hover {
      background: #ff3742;
    }

    .attack-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      color: #856404;
    }

    .attack-warning h4 {
      margin: 0 0 10px 0;
      color: #856404;
    }

    .attack-types {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .attack-card {
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .attack-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .attack-card.selected {
      border-color: #ff4757;
      background: #fff5f5;
    }

    .attack-card.selected::after {
      content: '✓';
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff4757;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .attack-card h3 {
      margin: 0 0 10px 0;
      color: var(--primary);
      font-size: 1.1rem;
    }

    .attack-card p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .attack-card.dos { border-color: #ff6b6b; }
    .attack-card.ddos { border-color: #ff4757; }
    .attack-card.brute { border-color: #ffa726; }
    .attack-card.sql { border-color: #ab47bc; }
    .attack-card.xss { border-color: #66bb6a; }
    .attack-card.scan { border-color: #26a69a; }

    .attack-card.dos.selected { background: #ffeaea; }
    .attack-card.ddos.selected { background: #fff5f5; }
    .attack-card.brute.selected { background: #fff8e1; }
    .attack-card.sql.selected { background: #f3e5f5; }
    .attack-card.xss.selected { background: #e8f5e8; }
    .attack-card.scan.selected { background: #e0f2f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Attack Simulator</h1>
      <p>Test intrusion detection systems with simulated attack patterns</p>

      <div style="margin-top: 16px; display: flex; justify-content: center;">
        <button id="logoutBtn" class="btn btn-outline hidden">Logout</button>
      </div>

      <!-- Mode Toggle (hidden: this page is Attack Simulator only) -->
      <div id="modeToggle" style="margin-top: 20px; text-align: center; display: none;">
        <div style="display: inline-flex; background: var(--bg); border-radius: 25px; padding: 4px; border: 1px solid var(--border);">
          <button id="trafficModeBtn" class="mode-btn active" style="padding: 8px 20px; border: none; border-radius: 20px; background: var(--primary); color: white; cursor: pointer; transition: all 0.3s ease;">Traffic Testing</button>
          <button id="attackModeBtn" class="mode-btn" style="padding: 8px 20px; border: none; border-radius: 20px; background: transparent; color: var(--text); cursor: pointer; transition: all 0.3s ease;">Attack Simulation</button>
        </div>
      </div>
    </div>

    <!-- Attack Mode Warning -->
    <div id="attackWarning" class="attack-warning hidden">
      <h4>⚠️ Attack Simulation Mode</h4>
      <p><strong>WARNING:</strong> This mode is for testing intrusion detection systems in controlled environments only. Do not use against production systems or without explicit permission. All simulations are logged and monitored.</p>
    </div>

    <!-- Login Panel -->
    <div id="loginPanel" class="login-panel">
      <h2 style="text-align: center; margin-bottom: 30px; color: var(--primary);">Stimulator Access</h2>

      <form id="loginForm">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" class="form-input" required>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" class="form-input" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
      </form>

      <div id="loginError" class="error-message hidden">Invalid credentials</div>
    </div>
    <!-- Attack Types Selection -->
    <div id="attackTypesPanel" class="stimulator-panel hidden">
      <h2 style="text-align: center; margin-bottom: 18px; color: var(--primary);">Attack Simulator Dashboard</h2>

      <div style="display: flex; justify-content: center; gap: 12px; align-items: center; margin-bottom: 18px; flex-wrap: wrap;">
        <label for="intensitySelect" style="font-weight: 600; color: var(--text);">Intensity</label>
        <select id="intensitySelect" class="form-input" style="max-width: 220px;">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="very_high">Very High Traffic</option>
        </select>
      </div>

      <div style="text-align: center; margin-top: -10px; margin-bottom: 25px;">
        <button id="startAttackBtnTop" class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px;" disabled>🚀 Start Attack Simulation</button>
      </div>

      <div class="attack-types">
        <div class="attack-card ddos" data-attack="ddos">
          <h3>DDoS</h3>
          <p>High request-rate flooding across common endpoints.</p>
        </div>

        <div class="attack-card dos" data-attack="bot">
          <h3>Bot Traffic</h3>
          <p>API-heavy automated browsing and scraping patterns.</p>
        </div>

        <div class="attack-card brute" data-attack="brute_force">
          <h3>Brute Force</h3>
          <p>Repeated login attempts against the authentication endpoint.</p>
        </div>

        <div class="attack-card scan" data-attack="spike_load">
          <h3>Spike Load</h3>
          <p>Short burst traffic spike that causes sudden degradation.</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <button id="startAttackBtn" class="btn btn-primary" style="font-size: 1.1rem; padding: 12px 30px;" disabled>🚀 Start Attack Simulation</button>
      </div>
    </div>
    <div id="stimulatorPanel" class="stimulator-panel hidden" style="display:none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="color: var(--primary);">Traffic Controls</h2>
      </div>

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="visitsGenerated">0</div>
          <div class="stat-label">Visits Generated</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="actionsPerformed">0</div>
          <div class="stat-label">Actions Performed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="currentStatus">Ready</div>
          <div class="stat-label">Status</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="successRate">100%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="stimulator-controls">
        <div class="control-group">
          <h3>Page Visits</h3>
          <div class="control-input">
            <label>Visit Count:</label>
            <input type="range" id="visitCount" min="1" max="100" value="10">
            <span class="value" id="visitCountValue">10</span>
          </div>
          <div class="control-input">
            <label>Delay (ms):</label>
            <input type="number" id="visitDelay" min="100" max="5000" value="1000">
          </div>
        </div>

        <div class="control-group">
          <h3>User Actions</h3>
          <div class="control-input">
            <label>Action Count:</label>
            <input type="range" id="actionCount" min="1" max="50" value="5">
            <span class="value" id="actionCountValue">5</span>
          </div>
          <div class="control-input">
            <label>Action Delay:</label>
            <input type="number" id="actionDelay" min="500" max="10000" value="2000">
          </div>
        </div>

        <div class="control-group">
          <h3>Advanced Options</h3>
          <div class="control-input">
            <label>Concurrent Users:</label>
            <input type="number" id="concurrentUsers" min="1" max="10" value="1">
          </div>
          <div class="control-input">
            <label>Random Variation:</label>
            <input type="range" id="randomVariation" min="0" max="100" value="20">
            <span class="value" id="randomVariationValue">20%</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button id="startVisitsBtn" class="btn btn-primary">🚀 Start Page Visits</button>
        <button id="startActionsBtn" class="btn btn-primary">⚡ Start User Actions</button>
        <button id="startCombinedBtn" class="btn btn-primary">🎯 Start Combined Traffic</button>
        <button id="stopBtn" class="btn btn-outline" disabled>⏹️ Stop</button>
        <button id="clearStatsBtn" class="btn btn-outline">🧹 Clear Stats</button>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>

      <!-- Activity Log -->
      <div style="margin-top: 30px;">
        <h3 style="margin-bottom: 15px; color: var(--primary);">Activity Log</h3>
        <div id="activityLog" class="log-area">
          <div class="log-entry info">Attack simulator ready. Select an attack type to begin.</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>DemoKart Attack Simulator - For testing intrusion detection systems only</p>
    </div>
  </div>

  <script>
    // DOM Elements
    const loginPanel = document.getElementById("loginPanel");
    const stimulatorPanel = document.getElementById("stimulatorPanel");
    const attackTypesPanel = document.getElementById("attackTypesPanel");
    const attackWarning = document.getElementById("attackWarning");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");

    // Mode buttons
    const trafficModeBtn = document.getElementById("trafficModeBtn");
    const attackModeBtn = document.getElementById("attackModeBtn");
    const startAttackBtn = document.getElementById("startAttackBtn");
    const startAttackBtnTop = document.getElementById("startAttackBtnTop");

    // Attack cards
    const attackCards = document.querySelectorAll(".attack-card");

    // Stats elements
    const visitsGeneratedEl = document.getElementById("visitsGenerated");
    const actionsPerformedEl = document.getElementById("actionsPerformed");
    const currentStatusEl = document.getElementById("currentStatus");
    const successRateEl = document.getElementById("successRate");

    // Control elements
    const visitCountEl = document.getElementById("visitCount");
    const visitCountValueEl = document.getElementById("visitCountValue");
    const visitDelayEl = document.getElementById("visitDelay");
    const actionCountEl = document.getElementById("actionCount");
    const actionCountValueEl = document.getElementById("actionCountValue");
    const actionDelayEl = document.getElementById("actionDelay");
    const concurrentUsersEl = document.getElementById("concurrentUsers");
    const randomVariationEl = document.getElementById("randomVariation");
    const randomVariationValueEl = document.getElementById("randomVariationValue");

    // Button elements
    const startVisitsBtn = document.getElementById("startVisitsBtn");
    const startActionsBtn = document.getElementById("startActionsBtn");
    const startCombinedBtn = document.getElementById("startCombinedBtn");
    const stopBtn = document.getElementById("stopBtn");
    const clearStatsBtn = document.getElementById("clearStatsBtn");

    // Progress and log elements
    const progressFillEl = document.getElementById("progressFill");
    const activityLogEl = document.getElementById("activityLog");

    // Intensity selector
    const intensitySelect = document.getElementById('intensitySelect');

    // State variables
    let isRunning = false;
    let isAttackMode = false;
    let selectedAttack = null;
    let visitsGenerated = 0;
    let actionsPerformed = 0;
    let totalRequests = 0;
    let successfulRequests = 0;
    let abortController = null;

    function setAttackStartButtonsState({ disabled, text } = {}) {
      [startAttackBtn, startAttackBtnTop].forEach((btn) => {
        if (!btn) return;
        if (typeof disabled === 'boolean') btn.disabled = disabled;
        if (typeof text === 'string') btn.textContent = text;
      });
    }

    // Security helpers: sanitize and safely set input values
    function sanitizeString(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeSetInputValue(el, value) {
      if (!el) return;
      // Always set via .value to avoid HTML parsing/execution
      try {
        el.value = value == null ? '' : String(value);
      } catch (e) {
        el.setAttribute('value', String(value));
      }
    }

    function removeInjectedScripts() {
      // Remove any script tags that may have been injected into the DOM
      document.querySelectorAll('script[data-injected=xss]').forEach(s => s.remove());
    }

    function processUrlParams() {
      try {
        const params = new URLSearchParams(window.location.search);
        const u = params.get('username');
        const p = params.get('password');

        if (u !== null) {
          // sanitize and set safely
          safeSetInputValue(document.getElementById('username'), u);
        }
        if (p !== null) {
          safeSetInputValue(document.getElementById('password'), p);
        }

        // Clean the URL to avoid leaving potentially harmful query strings
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (e) {
        console.warn('Failed to process URL params safely', e);
      }
    }

    // Initialize
    function init() {
      // Remove any injected scripts and process URL params safely before initializing
      removeInjectedScripts();
      processUrlParams();

      setupEventListeners();
      updateControlValues();
      checkStimulatorAuth();
    }

    function setupEventListeners() {
      // Login form
      loginForm.addEventListener("submit", handleLogin);

      // Logout
      logoutBtn.addEventListener("click", handleLogout);

      // Mode switching (guard if UI changes)
      if (trafficModeBtn) trafficModeBtn.addEventListener("click", () => switchMode(false));
      if (attackModeBtn) attackModeBtn.addEventListener("click", () => switchMode(true));

      // Attack type selection
      attackCards.forEach(card => {
        card.addEventListener("click", () => toggleAttackSelection(card));
      });

      // Start/Stop attack button
      if (startAttackBtn) startAttackBtn.addEventListener("click", startAttackSimulation);
      else console.warn('[simulator/ui] missing #startAttackBtn');
      if (startAttackBtnTop) startAttackBtnTop.addEventListener("click", startAttackSimulation);
      else console.warn('[simulator/ui] missing #startAttackBtnTop');

      // Control sliders
      visitCountEl.addEventListener("input", () => updateControlValues());
      actionCountEl.addEventListener("input", () => updateControlValues());
      randomVariationEl.addEventListener("input", () => updateControlValues());

      // Action buttons
      startVisitsBtn.addEventListener("click", () => startTraffic('visits'));
      startActionsBtn.addEventListener("click", () => startTraffic('actions'));
      startCombinedBtn.addEventListener("click", () => startTraffic('combined'));
      stopBtn.addEventListener("click", handleStop);
      clearStatsBtn.addEventListener("click", clearStats);
    }

    function updateControlValues() {
      visitCountValueEl.textContent = visitCountEl.value;
      actionCountValueEl.textContent = actionCountEl.value;
      randomVariationValueEl.textContent = randomVariationEl.value + '%';
    }

    function toggleStimulator(isStimulator) {
      if (isStimulator) {
        loginPanel.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        // Default to Attack Simulation mode after auth
        switchMode(true);
      } else {
        stimulatorPanel.classList.add("hidden");
        attackTypesPanel.classList.add("hidden");
        attackWarning.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.add('hidden');
        loginPanel.classList.remove("hidden");
      }
    }

    function checkStimulatorAuth() {
      fetch("/api/stimulator/me", { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
          toggleStimulator(Boolean(data.isStimulator));
        })
        .catch(() => {
          toggleStimulator(false);
        });
    }

    function handleLogin(event) {
      event.preventDefault();
      loginError.classList.add("hidden");

      const formData = new FormData(loginForm);
      const payload = {
        username: formData.get("username"),
        password: formData.get("password")
      };

      fetch("/api/stimulator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          loginError.textContent = "Invalid username or password.";
          loginError.classList.remove("hidden");
          return;
        }

        loginForm.reset();
        toggleStimulator(true);
        logActivity("success", "Logged in as stimulator");
      })
      .catch(() => {
        loginError.textContent = "Login failed. Try again.";
        loginError.classList.remove("hidden");
      });
    }

    function handleLogout() {
      fetch("/api/stimulator/logout", { method: "POST", credentials: 'same-origin' })
        .then(() => {
          toggleStimulator(false);
          clearStats();
          logActivity("info", "Logged out");
        });
    }

    function startTraffic(type) {
      if (isRunning) return;

      isRunning = true;
      abortController = new AbortController();
      updateUIState(true);

      const config = getTrafficConfig(type);

      logActivity("info", `Starting ${type} traffic simulation...`);

      switch (type) {
        case 'visits':
          simulatePageVisits(config);
          break;
        case 'actions':
          simulateUserActions(config);
          break;
        case 'combined':
          simulateCombinedTraffic(config);
          break;
      }
    }

    function handleStop() {
      if (!isRunning) return;

      isRunning = false;
      if (abortController) {
        abortController.abort();
      }

      // Reset attack button if in attack mode
      if (isAttackMode) {
        stopBackendAttack();
      } else {
        updateUIState(false);
      }

      updateStatus("Stopped");
      logActivity("warning", "Simulation stopped by user");
    }

    function clearStats() {
      visitsGenerated = 0;
      actionsPerformed = 0;
      totalRequests = 0;
      successfulRequests = 0;

      visitsGeneratedEl.textContent = "0";
      actionsPerformedEl.textContent = "0";
      successRateEl.textContent = "100%";
      progressFillEl.style.width = "0%";

      logActivity("info", "Statistics cleared");
    }

    function getTrafficConfig(type) {
      const baseDelay = parseInt(visitDelayEl.value);
      const actionDelay = parseInt(actionDelayEl.value);
      const concurrentUsers = parseInt(concurrentUsersEl.value);
      const randomVariation = parseInt(randomVariationEl.value) / 100;

      return {
        visitCount: type === 'actions' ? 0 : parseInt(visitCountEl.value),
        actionCount: type === 'visits' ? 0 : parseInt(actionCountEl.value),
        baseDelay,
        actionDelay,
        concurrentUsers,
        randomVariation,
        type
      };
    }

    function simulatePageVisits(config) {
      const { visitCount, baseDelay, concurrentUsers, randomVariation } = config;
      let completed = 0;

      updateStatus("Generating page visits...");

      for (let i = 0; i < concurrentUsers; i++) {
        setTimeout(() => {
          generateVisitsForUser(visitCount / concurrentUsers, baseDelay, randomVariation, () => {
            completed++;
            if (completed >= concurrentUsers) {
              finishTraffic("Page visits completed");
            }
          });
        }, i * 100);
      }
    }

    function simulateUserActions(config) {
      const { actionCount, actionDelay, concurrentUsers, randomVariation } = config;
      let completed = 0;

      updateStatus("Performing user actions...");

      for (let i = 0; i < concurrentUsers; i++) {
        setTimeout(() => {
          generateActionsForUser(actionCount / concurrentUsers, actionDelay, randomVariation, () => {
            completed++;
            if (completed >= concurrentUsers) {
              finishTraffic("User actions completed");
            }
          });
        }, i * 200);
      }
    }

    function simulateCombinedTraffic(config) {
      const { visitCount, actionCount, baseDelay, actionDelay, concurrentUsers, randomVariation } = config;
      let completed = 0;

      updateStatus("Generating combined traffic...");

      for (let i = 0; i < concurrentUsers; i++) {
        setTimeout(() => {
          // First generate visits, then actions
          generateVisitsForUser(visitCount / concurrentUsers, baseDelay, randomVariation, () => {
            generateActionsForUser(actionCount / concurrentUsers, actionDelay, randomVariation, () => {
              completed++;
              if (completed >= concurrentUsers) {
                finishTraffic("Combined traffic completed");
              }
            });
          });
        }, i * 150);
      }
    }

    function generateVisitsForUser(count, baseDelay, randomVariation, callback) {
      let completed = 0;

      for (let i = 0; i < count; i++) {
        if (!isRunning) return;

        const delay = baseDelay + (Math.random() - 0.5) * baseDelay * randomVariation * 2;

        setTimeout(() => {
          if (!isRunning) return;

          makeRequest("/", "GET")
            .then(() => {
              visitsGenerated++;
              visitsGeneratedEl.textContent = visitsGenerated;
              logActivity("success", `Page visit ${visitsGenerated} completed`);
              updateProgress();

              completed++;
              if (completed >= count) {
                callback();
              }
            })
            .catch(() => {
              logActivity("error", `Page visit failed`);
              completed++;
              if (completed >= count) {
                callback();
              }
            });
        }, i * delay);
      }
    }

    function generateActionsForUser(count, baseDelay, randomVariation, callback) {
      let completed = 0;
      const actions = [
        () => makeRequest("/api/products", "GET"),
        () => makeRequest("/api/categories", "GET"),
        () => makeRequest("/api/products/1", "GET"),
        () => makeRequest("/api/user/me", "GET"),
        () => makeRequest("/api/cart", "GET")
      ];

      for (let i = 0; i < count; i++) {
        if (!isRunning) return;

        const delay = baseDelay + (Math.random() - 0.5) * baseDelay * randomVariation * 2;
        const action = actions[Math.floor(Math.random() * actions.length)];

        setTimeout(() => {
          if (!isRunning) return;

          action()
            .then(() => {
              actionsPerformed++;
              actionsPerformedEl.textContent = actionsPerformed;
              logActivity("success", `User action ${actionsPerformed} completed`);
              updateProgress();

              completed++;
              if (completed >= count) {
                callback();
              }
            })
            .catch(() => {
              logActivity("error", `User action failed`);
              completed++;
              if (completed >= count) {
                callback();
              }
            });
        }, i * delay);
      }
    }

    function makeRequest(url, method = "GET", body = null) {
      totalRequests++;

      const options = {
        method,
        signal: abortController?.signal,
        credentials: 'same-origin'
      };

      if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
      }

      return fetch(url, options)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          successfulRequests++;
          updateSuccessRate();

          if (response.status === 204) return null;
          const contentType = (response.headers.get('content-type') || '').toLowerCase();
          if (contentType.includes('application/json')) {
            try {
              return await response.json();
            } catch {
              return null;
            }
          }

          // For HTML/text responses (e.g. GET /), treat as success.
          try {
            return await response.text();
          } catch {
            return null;
          }
        });
    }

    function updateUIState(running) {
      const buttons = [startVisitsBtn, startActionsBtn, startCombinedBtn];
      buttons.forEach(btn => btn.disabled = running);
      stopBtn.disabled = !running;
    }

    function updateStatus(status) {
      currentStatusEl.textContent = status;
    }

    function updateProgress() {
      const total = parseInt(visitCountEl.value) + parseInt(actionCountEl.value);
      const current = visitsGenerated + actionsPerformed;
      const percentage = total > 0 ? (current / total) * 100 : 0;
      progressFillEl.style.width = percentage + "%";
    }

    function updateSuccessRate() {
      const rate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
      successRateEl.textContent = Math.round(rate) + "%";
    }

    function finishTraffic(message) {
      isRunning = false;
      updateUIState(false);
      updateStatus("Completed");
      logActivity("success", message);
    }

    function logAttackToBackend(attackType, details, severity = 'medium') {
      return fetch('/api/stimulator/log-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackType, details, severity })
      }).catch(err => {
        console.log('Failed to log attack:', err);
      });
    }

    function switchMode(attackMode) {
      isAttackMode = attackMode;
      const body = document.body;

      if (attackMode) {
        body.classList.add("attack-mode");
        trafficModeBtn.classList.remove("active");
        attackModeBtn.classList.add("active");
        attackWarning.classList.remove("hidden");
        stimulatorPanel.classList.add("hidden");
        attackTypesPanel.classList.remove("hidden");
        document.querySelector('.header h1').textContent = '🛡️ Attack Simulator';
        document.querySelector('.header p').textContent = 'Test intrusion detection systems with simulated attack patterns';
      } else {
        body.classList.remove("attack-mode");
        attackModeBtn.classList.remove("active");
        trafficModeBtn.classList.add("active");
        attackWarning.classList.add("hidden");
        attackTypesPanel.classList.add("hidden");
        stimulatorPanel.classList.remove("hidden");
        document.querySelector('.header h1').textContent = '🚀 Traffic Stimulator';
        document.querySelector('.header p').textContent = 'Simulate website traffic for testing analytics and performance';
      }

      // Reset attack selection when switching modes
      selectedAttack = null;
      attackCards.forEach(card => card.classList.remove("selected"));
      setAttackStartButtonsState({ disabled: true, text: '🚀 Start Attack Simulation' });
    }

    function toggleAttackSelection(card) {
      const attackType = card.dataset.attack;

      // Single-selection (simpler + matches dashboard spec)
      if (selectedAttack === attackType) {
        selectedAttack = null;
        card.classList.remove('selected');
      } else {
        selectedAttack = attackType;
        attackCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      }

      // Immediately reflect selection across storefront/admin via realtime metrics.
      try {
        const payload = { attackType: selectedAttack };
        console.log('[simulator/ui] select', payload);
        fetch('/api/simulator/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        })
          .then(r => r.json().catch(() => null).then(data => ({ ok: r.ok, status: r.status, data })))
          .then(out => console.log('[simulator/ui] select response', out))
          .catch(() => {});
      } catch {
        // ignore
      }

      updateAttackButtons();
    }

    function startAttackSimulation() {
      try {
        const intensity = intensitySelect ? intensitySelect.value : 'low';
        console.log('[simulator/ui] start button click', { selectedAttack, intensity, isRunning });
      } catch {
        // ignore
      }
      if (!selectedAttack) return;

      // Toggle stop if already running
      if (isRunning) {
        stopBackendAttack();
        return;
      }

      startBackendAttack();
    }

    function updateAttackButtons() {
      setAttackStartButtonsState({
        disabled: !selectedAttack,
        text: isRunning ? '⏹️ Stop Attack' : '🚀 Start Attack Simulation'
      });
    }

    async function startBackendAttack() {
      if (!selectedAttack) return;
      isRunning = true;
      updateAttackButtons();
      updateStatus('Attack simulation running...');

      const intensity = intensitySelect ? intensitySelect.value : 'low';
      logActivity('warning', `Starting attack: ${selectedAttack} (${intensity})`);

      try {
        const payload = {
          isRunning: true,
          attackType: selectedAttack,
          intensity
        };
        console.log('[simulator/ui] start', payload);
        const res = await fetch('/api/simulator/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('[simulator/ui] start response', { ok: res.ok, status: res.status, data });
        if (!data.ok) {
          isRunning = false;
          updateAttackButtons();
          updateStatus('Failed');
          logActivity('error', data.message || 'Failed to start attack');
          return;
        }

        logActivity('error', `Attack started: ${data.attackType} (${data.intensity})`);
      } catch (e) {
        isRunning = false;
        updateAttackButtons();
        updateStatus('Failed');
        logActivity('error', 'Failed to start attack');
      }
    }

    async function stopBackendAttack() {
      if (!isRunning) return;
      try {
        console.log('[simulator/ui] stop');
        const res = await fetch('/api/simulator/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ isRunning: false })
        });
        const data = await res.json().catch(() => null);
        console.log('[simulator/ui] stop response', { ok: res.ok, status: res.status, data });
      } catch {
        // ignore
      }
      isRunning = false;
      updateAttackButtons();
      updateStatus('Stopped');
      logActivity('info', 'Attack stopped');
    }

    // Kick things off: bind handlers + check session.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  </script>
</body>
</html>