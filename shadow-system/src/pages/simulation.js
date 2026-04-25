// ══════════════════════════════════════════
// Shadow System — Simulation Control Panel
// Launch simulated attacks and watch the
// detection engine respond in real-time.
// ══════════════════════════════════════════

import { icons } from '../icons.js';
import { behaviorModel } from '../engine/model.js';
import { analyzeAnomaly, generateSimulatedAnomaly } from '../engine/anomaly.js';
import { showToast } from '../components/toast.js';

let logInterval = null;

export function renderSimulation(userId) {
  return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Attack Simulation Lab</h1>
          <p class="page-subtitle">Test the detection engine with simulated behavioral anomalies</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="sim-reset">${icons.x} Reset</button>
      </div>

      <!-- Simulation Cards -->
      <div class="sim-cards">
        <div class="glass-card sim-card" data-sim="bot" id="sim-card-bot">
          <div class="sim-icon" style="background:var(--red-dim);">
            ${icons.bot}
          </div>
          <div class="sim-title">Bot Pattern</div>
          <div class="sim-desc">Simulates rapid automated clicks, erratic navigation, and zero idle time</div>
          <button class="btn btn-primary btn-sm" data-launch="bot" id="sim-launch-bot">${icons.zap} Launch</button>
        </div>

        <div class="glass-card sim-card" data-sim="credential" id="sim-card-credential">
          <div class="sim-icon" style="background:var(--amber-dim);">
            ${icons.key}
          </div>
          <div class="sim-title">Credential Theft</div>
          <div class="sim-desc">Simulates unusual login timing, minimal activity, and high idle ratio</div>
          <button class="btn btn-primary btn-sm" data-launch="credential" id="sim-launch-credential">${icons.zap} Launch</button>
        </div>

        <div class="glass-card sim-card" data-sim="insider" id="sim-card-insider">
          <div class="sim-icon" style="background:var(--purple-dim);">
            ${icons.userAlert}
          </div>
          <div class="sim-title">Insider Threat</div>
          <div class="sim-desc">Simulates gradual behavior drift with elevated activity and pattern changes</div>
          <button class="btn btn-primary btn-sm" data-launch="insider" id="sim-launch-insider">${icons.zap} Launch</button>
        </div>
      </div>

      <!-- Live Detection Feed -->
      <div class="glass-card detection-feed">
        <div class="feed-header">
          <span class="feed-title">${icons.activity} Live Detection Feed</span>
          <span class="badge badge-cyan" id="sim-status">Idle</span>
        </div>
        <div class="feed-log" id="detection-log">
          <div class="log-line">
            <span class="log-time">${getTimeStr()}</span>
            <span class="log-status normal">READY</span>
            <span class="log-message">Detection engine initialized. Select a simulation to begin.</span>
          </div>
        </div>
      </div>

      <!-- Alert Banner (hidden initially) -->
      <div class="alert-banner danger" id="sim-alert-banner">
        <div class="alert-icon-box">${icons.alert}</div>
        <div class="alert-content">
          <div class="alert-title" id="alert-title">THREAT DETECTED</div>
          <div class="alert-desc" id="alert-desc">Loading analysis...</div>
        </div>
        <div class="alert-score" id="alert-score">—%</div>
      </div>
    </div>
  `;
}

function getTimeStr() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function addLogLine(status, message) {
  const log = document.getElementById('detection-log');
  if (!log) return;

  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `
    <span class="log-time">${getTimeStr()}</span>
    <span class="log-status ${status}">${status.toUpperCase()}</span>
    <span class="log-message">${message}</span>
  `;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function runSimulation(type, userId) {
  // Stop any existing simulation
  if (logInterval) clearInterval(logInterval);

  const baseline = behaviorModel.getBaseline(userId);
  const simFeatures = generateSimulatedAnomaly(type, baseline);
  const analysis = analyzeAnomaly(simFeatures, baseline);

  const log = document.getElementById('detection-log');
  if (log) log.innerHTML = '';

  const statusBadge = document.getElementById('sim-status');
  if (statusBadge) {
    statusBadge.textContent = 'Running';
    statusBadge.className = 'badge badge-amber';
  }

  // Hide alert banner
  const banner = document.getElementById('sim-alert-banner');
  if (banner) banner.classList.remove('visible');

  const labels = { bot: 'Bot Pattern', credential: 'Credential Theft', insider: 'Insider Threat' };

  // Step-by-step log simulation
  const steps = [
    { delay: 200, status: 'normal', msg: `Simulation started: ${labels[type]}` },
    { delay: 600, status: 'normal', msg: 'Capturing simulated behavioral data...' },
    { delay: 1000, status: 'normal', msg: `Click rate: ${simFeatures.clickRate} cpm (baseline: ${baseline.avgClickRate})` },
    { delay: 1400, status: 'normal', msg: `Session duration: ${simFeatures.sessionDuration}s (baseline: ${baseline.avgSessionDuration}s)` },
    { delay: 1800, status: 'normal', msg: `Navigation entropy: ${simFeatures.navEntropy} (baseline: ${baseline.avgNavEntropy})` },
    { delay: 2200, status: 'normal', msg: `Idle ratio: ${simFeatures.idleRatio} (baseline: ${baseline.avgIdleRatio})` },
    { delay: 2600, status: 'warning', msg: 'Running weighted deviation analysis...' },
    { delay: 3000, status: 'warning', msg: 'Computing anomaly score...' },
  ];

  // Add explanation steps
  analysis.explanations.forEach((exp, i) => {
    steps.push({
      delay: 3400 + i * 400,
      status: 'anomaly',
      msg: `${exp.feature}: ${exp.message}`,
    });
  });

  // Final verdict
  const lastDelay = 3400 + analysis.explanations.length * 400 + 400;
  steps.push({
    delay: lastDelay,
    status: analysis.riskScore > 65 ? 'anomaly' : analysis.riskScore > 35 ? 'warning' : 'normal',
    msg: `VERDICT: Risk Score ${analysis.riskScore}% — ${analysis.riskLevel.label}`,
  });

  steps.forEach(step => {
    setTimeout(() => addLogLine(step.status, step.msg), step.delay);
  });

  // Show alert banner at the end
  setTimeout(() => {
    if (statusBadge) {
      statusBadge.textContent = 'Complete';
      statusBadge.className = `badge badge-${analysis.riskLevel.color}`;
    }

    if (analysis.riskScore > 35 && banner) {
      const title = document.getElementById('alert-title');
      const desc = document.getElementById('alert-desc');
      const score = document.getElementById('alert-score');

      if (title) title.textContent = analysis.riskScore > 65 ? '⚠ THREAT DETECTED' : '⚡ SUSPICIOUS BEHAVIOR';
      if (desc) desc.textContent = analysis.explanations.length > 0
        ? `Reason: ${analysis.explanations[0].message}`
        : 'Multiple behavioral deviations detected';
      if (score) score.textContent = `${analysis.riskScore}%`;

      banner.classList.add('visible');

      showToast('danger', `Anomaly detected! Risk: ${analysis.riskScore}% — ${analysis.riskLevel.label}`, 6000);
    } else {
      showToast('success', `Simulation complete. Risk: ${analysis.riskScore}% — ${analysis.riskLevel.label}`, 4000);
    }
  }, lastDelay + 600);
}

export function initSimulation(userId) {
  // Launch buttons
  document.querySelectorAll('[data-launch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.launch;

      // Visual active state
      document.querySelectorAll('.sim-card').forEach(c => c.classList.remove('active'));
      const card = document.querySelector(`[data-sim="${type}"]`);
      if (card) card.classList.add('active');

      runSimulation(type, userId);
    });
  });

  // Reset button
  const resetBtn = document.getElementById('sim-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (logInterval) clearInterval(logInterval);
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'simulation' }));
    });
  }
}
