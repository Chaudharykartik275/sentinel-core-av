// ══════════════════════════════════════════
// Shadow System — Analytics Page
// Behavioral comparison: Baseline vs Current
// ══════════════════════════════════════════

import { icons } from '../icons.js';
import { tracker } from '../engine/tracker.js';
import { behaviorModel } from '../engine/model.js';
import { analyzeAnomaly } from '../engine/anomaly.js';

export function renderAnalytics(userId) {
  const features = tracker.getSessionFeatures();
  const baseline = behaviorModel.getBaseline(userId);
  const analysis = analyzeAnomaly(features, baseline);

  const metrics = [
    {
      name: 'Click Rate (cpm)',
      current: features.clickRate,
      baseline: baseline.avgClickRate,
      max: Math.max(features.clickRate, baseline.avgClickRate, 30) * 1.2,
      color: 'var(--cyan)',
    },
    {
      name: 'Session Duration (s)',
      current: features.sessionDuration,
      baseline: baseline.avgSessionDuration,
      max: Math.max(features.sessionDuration, baseline.avgSessionDuration, 600) * 1.2,
      color: 'var(--purple)',
    },
    {
      name: 'Navigation Entropy',
      current: features.navEntropy,
      baseline: baseline.avgNavEntropy,
      max: 1,
      color: 'var(--amber)',
    },
    {
      name: 'Idle Ratio',
      current: features.idleRatio,
      baseline: baseline.avgIdleRatio,
      max: 1,
      color: 'var(--green)',
    },
    {
      name: 'Avg Click Interval (ms)',
      current: features.avgClickInterval,
      baseline: baseline.avgClickInterval,
      max: Math.max(features.avgClickInterval, baseline.avgClickInterval, 5000) * 1.2,
      color: 'var(--red)',
    },
  ];

  return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Behavioral Analytics</h1>
          <p class="page-subtitle">Digital Twin comparison — Baseline vs Current Session</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="analytics-refresh">${icons.activity} Live Update</button>
      </div>

      <!-- Behavior Comparison -->
      <div class="analytics-grid">
        <div class="glass-card behavior-comparison">
          <div class="comparison-header">
            <span style="font-weight:600;">${icons.analytics} Feature Comparison</span>
            <div class="comparison-legend">
              <div class="legend-item">
                <div class="legend-dot" style="background:rgba(255,255,255,0.2);"></div> Baseline (Shadow)
              </div>
              <div class="legend-item">
                <div class="legend-dot" style="background:var(--cyan);"></div> Current
              </div>
            </div>
          </div>

          <div class="behavior-bars">
            ${metrics.map(m => {
              const baselineWidth = (m.baseline / m.max) * 100;
              const currentWidth = (m.current / m.max) * 100;
              return `
                <div class="behavior-metric">
                  <div class="metric-header">
                    <span class="metric-name">${m.name}</span>
                    <span class="metric-values">
                      <span style="color:var(--text-muted)">${m.baseline}</span> →
                      <span style="color:${m.color}">${m.current}</span>
                    </span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill baseline" style="width:${baselineWidth}%;background:${m.color};"></div>
                    <div class="bar-fill current" style="width:0%;background:${m.color};" data-target="${currentWidth}"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Deviation Radar Overview -->
        <div class="glass-card" style="padding:var(--space-lg);">
          <div style="font-weight:600;margin-bottom:var(--space-lg);">${icons.eye} Deviation Overview</div>
          
          <div style="display:flex;flex-direction:column;gap:var(--space-md);">
            ${Object.entries(analysis.deviations).map(([key, val]) => {
              const pct = Math.round(val * 100);
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              const color = pct > 60 ? 'var(--red)' : pct > 30 ? 'var(--amber)' : 'var(--green)';
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;">
                    <span style="color:var(--text-secondary);text-transform:capitalize;">${label}</span>
                    <span class="mono" style="color:${color}">${pct}%</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill current" style="width:0%;background:${color};" data-target="${pct}"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top:var(--space-xl);padding-top:var(--space-lg);border-top:1px solid var(--border-subtle);">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:0.85rem;color:var(--text-secondary);">Overall Risk Score</span>
              <span class="mono" style="font-size:1.5rem;font-weight:800;color:${
                analysis.riskScore > 65 ? 'var(--red)' : analysis.riskScore > 35 ? 'var(--amber)' : 'var(--green)'
              };">${analysis.riskScore}%</span>
            </div>
            <div class="bar-track" style="margin-top:8px;">
              <div class="bar-fill current" style="width:0%;background:${
                analysis.riskScore > 65 ? 'var(--red)' : analysis.riskScore > 35 ? 'var(--amber)' : 'var(--green)'
              };" data-target="${analysis.riskScore}"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Path -->
      <div class="glass-card" style="padding:var(--space-lg);margin-top:var(--space-xl);">
        <div style="font-weight:600;margin-bottom:var(--space-md);">${icons.navigation} Navigation Path Comparison</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);">
          <div>
            <span class="input-label">Baseline Pattern</span>
            <div class="mono" style="font-size:0.85rem;color:var(--text-secondary);padding:var(--space-md);background:rgba(0,0,0,0.2);border-radius:var(--radius-md);">
              ${baseline.commonNavSequence || 'No baseline data yet'}
            </div>
          </div>
          <div>
            <span class="input-label">Current Session</span>
            <div class="mono" style="font-size:0.85rem;color:var(--cyan);padding:var(--space-md);background:rgba(0,0,0,0.2);border-radius:var(--radius-md);">
              ${features.navSequence || 'Navigating...'}
            </div>
          </div>
        </div>
      </div>

      <!-- Session Features Table -->
      <div class="glass-card" style="padding:var(--space-lg);margin-top:var(--space-xl);">
        <div style="font-weight:600;margin-bottom:var(--space-md);">${icons.analytics} Raw Session Features</div>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead>
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <th style="text-align:left;padding:8px;color:var(--text-muted);font-weight:500;">Feature</th>
                <th style="text-align:right;padding:8px;color:var(--text-muted);font-weight:500;">Baseline</th>
                <th style="text-align:right;padding:8px;color:var(--text-muted);font-weight:500;">Current</th>
                <th style="text-align:right;padding:8px;color:var(--text-muted);font-weight:500;">Deviation</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.map(m => {
                const dev = m.baseline > 0 ? Math.round(Math.abs(m.current - m.baseline) / m.baseline * 100) : 0;
                const devColor = dev > 60 ? 'var(--red)' : dev > 30 ? 'var(--amber)' : 'var(--green)';
                return `
                  <tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:10px 8px;color:var(--text-secondary);">${m.name}</td>
                    <td class="mono" style="text-align:right;padding:10px 8px;color:var(--text-muted);">${m.baseline}</td>
                    <td class="mono" style="text-align:right;padding:10px 8px;color:var(--cyan);">${m.current}</td>
                    <td class="mono" style="text-align:right;padding:10px 8px;color:${devColor};">${dev}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function initAnalytics() {
  // Animate bar fills
  setTimeout(() => {
    document.querySelectorAll('.bar-fill.current[data-target]').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = `${bar.dataset.target}%`;
      }, 100 + i * 60);
    });
  }, 100);

  // Refresh button
  const btn = document.getElementById('analytics-refresh');
  if (btn) {
    btn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'analytics' }));
    });
  }
}
