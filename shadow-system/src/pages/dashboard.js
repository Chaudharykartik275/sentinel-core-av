// ══════════════════════════════════════════
// Shadow System — Dashboard Page
// The main hub showing risk score, digital
// twin status, and session activity.
// ══════════════════════════════════════════

import { icons } from '../icons.js';
import { tracker } from '../engine/tracker.js';
import { behaviorModel } from '../engine/model.js';
import { analyzeAnomaly } from '../engine/anomaly.js';

export function renderDashboard(userId) {
  const features = tracker.getSessionFeatures();
  const baseline = behaviorModel.getBaseline(userId);
  const analysis = analyzeAnomaly(features, baseline);

  const { riskScore, riskLevel } = analysis;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (riskScore / 100) * circumference;

  const colorMap = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' };
  const gaugeColor = colorMap[riskLevel.color] || 'var(--green)';

  return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Security Dashboard</h1>
          <p class="page-subtitle">Real-time behavioral intelligence overview</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" id="refresh-btn">${icons.activity} Refresh Analysis</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="dashboard-grid">
        <div class="glass-card stat-card">
          <span class="stat-label">Sessions Today</span>
          <span class="stat-value text-cyan">${baseline.sessionCount || 1}</span>
          <span class="stat-change text-green">↑ Active now</span>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">Anomalies Detected</span>
          <span class="stat-value" style="color:${riskScore > 35 ? 'var(--amber)' : 'var(--green)'}">${riskScore > 65 ? 1 : 0}</span>
          <span class="stat-change text-muted">This session</span>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">Behavior Match</span>
          <span class="stat-value text-green">${Math.max(0, 100 - riskScore)}%</span>
          <span class="stat-change text-muted">vs baseline</span>
        </div>
        <div class="glass-card stat-card">
          <span class="stat-label">Trust Score</span>
          <span class="stat-value" style="color:${gaugeColor}">${riskLevel.label}</span>
          <span class="stat-change" style="color:${gaugeColor}">Confidence: ${Math.max(0, 100 - riskScore)}%</span>
        </div>
      </div>

      <!-- Risk Gauge + Twin Status -->
      <div class="risk-section">
        <div class="glass-card risk-gauge-container">
          <div class="risk-gauge">
            <svg viewBox="0 0 200 200">
              <circle class="gauge-bg" cx="100" cy="100" r="90" />
              <circle class="gauge-fill" cx="100" cy="100" r="90"
                stroke="${gaugeColor}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}" />
            </svg>
            <div class="gauge-center">
              <span class="gauge-score" style="color:${gaugeColor}">${riskScore}%</span>
              <span class="gauge-label">Risk Score</span>
            </div>
          </div>
          <div style="text-align:center;margin-top:16px;">
            <span class="badge badge-${riskLevel.color}">${riskLevel.label}</span>
          </div>
        </div>

        <div class="glass-card twin-status">
          <div class="twin-status-header">
            <span class="pulse-dot green"></span>
            <span class="twin-status-title">Digital Twin Status</span>
            <span class="badge badge-cyan" style="margin-left:auto;">${baseline.isColdStart ? 'Learning' : 'Active'}</span>
          </div>
          <div class="twin-features">
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.mouse} Click Rate</span>
              <span class="twin-feature-value text-cyan">${features.clickRate} cpm</span>
            </div>
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.clock} Session Duration</span>
              <span class="twin-feature-value text-cyan">${features.sessionDuration}s</span>
            </div>
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.navigation} Nav Entropy</span>
              <span class="twin-feature-value text-cyan">${features.navEntropy}</span>
            </div>
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.eye} Idle Ratio</span>
              <span class="twin-feature-value text-cyan">${features.idleRatio}</span>
            </div>
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.zap} Total Clicks</span>
              <span class="twin-feature-value text-cyan">${features.totalClicks}</span>
            </div>
            <div class="twin-feature">
              <span class="twin-feature-label">${icons.activity} Model Sessions</span>
              <span class="twin-feature-value text-cyan">${baseline.sessionCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Section -->
      <div class="activity-section">
        <div class="glass-card chart-container">
          <div class="chart-header">
            <span class="chart-title">Session Activity (Last 7 Days)</span>
          </div>
          <div class="chart-area" id="session-chart"></div>
          <div class="chart-labels">
            <span class="chart-label-text">Mon</span>
            <span class="chart-label-text">Tue</span>
            <span class="chart-label-text">Wed</span>
            <span class="chart-label-text">Thu</span>
            <span class="chart-label-text">Fri</span>
            <span class="chart-label-text">Sat</span>
            <span class="chart-label-text">Sun</span>
          </div>
        </div>

        <div class="glass-card activity-feed">
          <div class="chart-header">
            <span class="chart-title">Recent Activity</span>
          </div>
          ${generateActivityFeed(riskScore)}
        </div>
      </div>

      ${analysis.explanations.length > 0 ? renderExplanations(analysis) : ''}
    </div>
  `;
}

function generateActivityFeed(riskScore) {
  const feedItems = [
    { icon: icons.check, bg: 'var(--green-dim)', text: '<strong>Session started</strong> — Behavioral tracking active', time: 'just now' },
    { icon: icons.fingerprint, bg: 'var(--cyan-dim)', text: '<strong>Digital Twin</strong> — Pattern comparison initialized', time: '2s ago' },
    { icon: icons.eye, bg: 'var(--purple-dim)', text: '<strong>Monitoring</strong> — Click and navigation patterns recording', time: '5s ago' },
    { icon: icons.shield, bg: 'var(--green-dim)', text: '<strong>Security</strong> — All behavioral signals within baseline', time: '1m ago' },
  ];

  if (riskScore > 35) {
    feedItems.unshift({
      icon: icons.alert, bg: 'var(--amber-dim)',
      text: '<strong>Warning</strong> — Behavioral deviation detected',
      time: 'just now',
    });
  }

  return feedItems.map(item => `
    <div class="feed-item">
      <div class="feed-icon" style="background:${item.bg}">${item.icon}</div>
      <div>
        <div class="feed-text">${item.text}</div>
        <div class="feed-time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

function renderExplanations(analysis) {
  return `
    <div class="glass-card" style="padding:var(--space-lg);margin-top:var(--space-xl);border-color:rgba(255,59,92,0.2);">
      <div class="chart-header">
        <span class="chart-title text-red">${icons.alert} Anomaly Explanations</span>
      </div>
      ${analysis.explanations.map(exp => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
          <span class="badge badge-${exp.severity === 'high' ? 'red' : 'amber'}">${exp.severity}</span>
          <span style="font-size:0.85rem;color:var(--text-secondary);">
            <strong>${exp.feature}</strong> — ${exp.message}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

export function initDashboard() {
  // Animate chart bars
  const chart = document.getElementById('session-chart');
  if (chart) {
    const data = [35, 60, 45, 80, 55, 20, 70];
    const maxVal = Math.max(...data);
    data.forEach((val, i) => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      const height = (val / maxVal) * 100;
      bar.style.height = '0%';
      bar.style.background = height > 70
        ? 'linear-gradient(to top, var(--amber), var(--red))'
        : 'linear-gradient(to top, var(--cyan), rgba(0,229,255,0.5))';
      bar.title = `${val} events`;
      chart.appendChild(bar);

      // Animate in with delay
      setTimeout(() => {
        bar.style.height = `${height}%`;
      }, 100 + i * 80);
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
    });
  }
}
