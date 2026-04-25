// ══════════════════════════════════════════
// Shadow System — Toast Notification System
// ══════════════════════════════════════════

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Show a toast notification.
 * @param {'danger'|'success'|'info'} type
 * @param {string} message
 * @param {number} duration - Auto-dismiss in ms (0 = manual)
 */
export function showToast(type, message, duration = 4000) {
  ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-text">${message}</span>
    <button class="toast-close" id="toast-close-btn">&times;</button>
  `;

  container.appendChild(toast);

  const close = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('#toast-close-btn').onclick = close;

  if (duration > 0) {
    setTimeout(close, duration);
  }

  return { close };
}
