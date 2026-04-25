// ══════════════════════════════════════════
// Shadow System — Main Application Entry
// Router, sidebar, and page management.
// ══════════════════════════════════════════

import './styles/index.css';
import { icons } from './icons.js';
import { tracker } from './engine/tracker.js';
import { behaviorModel } from './engine/model.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderAnalytics, initAnalytics } from './pages/analytics.js';
import { renderSimulation, initSimulation } from './pages/simulation.js';

// ── State ──
let currentPage = 'login';
let currentUser = null;

// ── Check existing session ──
const savedUser = sessionStorage.getItem('shadow_user');
if (savedUser) {
  try {
    const user = JSON.parse(savedUser);
    currentUser = user.id;
  } catch {}
}

// ── Sidebar Layout ──
function renderAppShell(pageContent) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'analytics', label: 'Analytics', icon: icons.analytics },
    { id: 'simulation', label: 'Simulation', icon: icons.simulation },
  ];

  return `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">${icons.shield}</div>
          <span class="brand-text">Shadow System</span>
        </div>

        <nav class="sidebar-nav">
          ${navItems.map(item => `
            <div class="nav-item ${currentPage === item.id ? 'active' : ''}"
                 data-page="${item.id}" id="nav-${item.id}">
              ${item.icon}
              <span>${item.label}</span>
              ${item.id === 'simulation' ? '<span class="nav-badge">LAB</span>' : ''}
            </div>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${(currentUser || 'U').charAt(0).toUpperCase()}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${currentUser || 'User'}</div>
              <div class="sidebar-user-role">Security Analyst</div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px;" id="logout-btn">
            ${icons.logout} Sign Out
          </button>
        </div>
      </aside>

      <main class="main-content" id="page-content">
        ${pageContent}
      </main>
    </div>
  `;
}

// ── Router ──
function navigate(page) {
  currentPage = page;

  // Track navigation in the behavior tracker
  tracker.recordPageVisit(page);

  const app = document.getElementById('app');

  if (page === 'login' || !currentUser) {
    app.innerHTML = renderLogin(handleLogin);
    initLogin(handleLogin);
    return;
  }

  let pageContent = '';
  switch (page) {
    case 'dashboard':
      pageContent = renderDashboard(currentUser);
      break;
    case 'analytics':
      pageContent = renderAnalytics(currentUser);
      break;
    case 'simulation':
      pageContent = renderSimulation(currentUser);
      break;
    default:
      pageContent = renderDashboard(currentUser);
  }

  app.innerHTML = renderAppShell(pageContent);
  initPage(page);
}

function initPage(page) {
  // Sidebar navigation click handlers
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.page;
      if (target !== currentPage) {
        navigate(target);
      }
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Save session data to model before logout
      const features = tracker.getSessionFeatures();
      behaviorModel.updateBaseline(currentUser, features);

      tracker.stop();
      tracker.reset();
      currentUser = null;
      sessionStorage.removeItem('shadow_user');
      navigate('login');
    });
  }

  // Page-specific init
  switch (page) {
    case 'dashboard':
      initDashboard();
      break;
    case 'analytics':
      initAnalytics();
      break;
    case 'simulation':
      initSimulation(currentUser);
      break;
  }
}

// ── Login handler ──
function handleLogin(userId) {
  currentUser = userId;
  tracker.reset();
  tracker.start();
  navigate('dashboard');
}

// ── Custom navigate event (used by pages to trigger re-render) ──
window.addEventListener('navigate', (e) => {
  navigate(e.detail);
});

// ── Initial render ──
if (currentUser) {
  tracker.start();
  navigate('dashboard');
} else {
  navigate('login');
}
