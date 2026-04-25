// ══════════════════════════════════════════
// Shadow System — Login Page
// ══════════════════════════════════════════

import { icons } from '../icons.js';

export function renderLogin(onLogin) {
  return `
    <div class="login-page">
      <div class="login-bg">
        <div class="grid-overlay"></div>
        <div class="radial-glow glow-1"></div>
        <div class="radial-glow glow-2"></div>
      </div>

      <div class="login-card glass-card">
        <div class="login-icon">${icons.fingerprint}</div>
        <h1 class="login-title">Shadow System</h1>
        <p class="login-subtitle">Digital Twin Behavioral Security Platform</p>

        <form class="login-form" id="login-form">
          <div class="input-group">
            <label class="input-label" for="login-email">Email</label>
            <input class="input-field" type="email" id="login-email" placeholder="agent@shadow.sys" required />
          </div>
          <div class="input-group">
            <label class="input-label" for="login-password">Password</label>
            <input class="input-field" type="password" id="login-password" placeholder="••••••••••" required />
          </div>
          <button class="btn btn-primary btn-lg" type="submit" id="login-submit-btn" style="width:100%;margin-top:8px;">
            ${icons.lock} Authenticate
          </button>
        </form>

        <div class="login-footer">
          <div class="fingerprint-status">
            <span class="pulse-dot green"></span>
            Behavioral Fingerprint: Active
          </div>
          <p class="text-muted" style="font-size:0.75rem;">Your Digital Twin is watching</p>
        </div>
      </div>
    </div>
  `;
}

export function initLogin(onLogin) {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
      // Simulate password hashing concept (bcrypt would be server-side)
      const userId = email.split('@')[0];
      sessionStorage.setItem('shadow_user', JSON.stringify({
        id: userId,
        email,
        loginTime: Date.now(),
      }));
      onLogin(userId);
    }
  });
}
