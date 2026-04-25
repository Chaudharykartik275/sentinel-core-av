// ══════════════════════════════════════════
// Shadow System — Event Tracker
// Captures user interaction patterns within
// the application for behavior modeling.
// ══════════════════════════════════════════

class EventTracker {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
    this.clickCount = 0;
    this.pageVisits = [];
    this.lastClickTime = 0;
    this.clickIntervals = [];
    this.idleTimer = null;
    this.idleStart = null;
    this.totalIdleTime = 0;
    this.isTracking = false;

    // Sampling: only capture every Nth mouse move (efficiency)
    this.mouseMoveCounter = 0;
    this.mouseSampleRate = 10;
  }

  /** Start tracking user behavior */
  start() {
    if (this.isTracking) return;
    this.isTracking = true;
    this.sessionStart = Date.now();

    document.addEventListener('click', this._onClick);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('visibilitychange', this._onVisibility);

    this._resetIdleTimer();
    console.log('[Tracker] Behavioral tracking started');
  }

  /** Stop tracking */
  stop() {
    this.isTracking = false;
    document.removeEventListener('click', this._onClick);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('visibilitychange', this._onVisibility);
    clearTimeout(this.idleTimer);
    console.log('[Tracker] Tracking stopped');
  }

  /** Record a page navigation */
  recordPageVisit(pageName) {
    this.pageVisits.push({
      page: pageName,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.sessionStart,
    });
  }

  /** Get current session features for anomaly analysis */
  getSessionFeatures() {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStart) / 1000; // seconds

    // Click rate (clicks per minute)
    const clickRate = sessionDuration > 0
      ? (this.clickCount / (sessionDuration / 60))
      : 0;

    // Average click interval
    const avgClickInterval = this.clickIntervals.length > 0
      ? this.clickIntervals.reduce((a, b) => a + b, 0) / this.clickIntervals.length
      : 0;

    // Navigation entropy (unique pages / total visits)
    const uniquePages = new Set(this.pageVisits.map(p => p.page)).size;
    const navEntropy = this.pageVisits.length > 0
      ? uniquePages / this.pageVisits.length
      : 0;

    // Navigation sequence as string for pattern comparison
    const navSequence = this.pageVisits.map(p => p.page).join(' → ');

    // Idle ratio
    const idleRatio = sessionDuration > 0
      ? this.totalIdleTime / (sessionDuration * 1000)
      : 0;

    return {
      clickRate: Math.round(clickRate * 100) / 100,
      avgClickInterval: Math.round(avgClickInterval),
      sessionDuration: Math.round(sessionDuration),
      navEntropy: Math.round(navEntropy * 100) / 100,
      navSequence,
      pageCount: this.pageVisits.length,
      idleRatio: Math.round(idleRatio * 100) / 100,
      totalClicks: this.clickCount,
    };
  }

  /** Reset current session data */
  reset() {
    this.events = [];
    this.clickCount = 0;
    this.pageVisits = [];
    this.clickIntervals = [];
    this.lastClickTime = 0;
    this.totalIdleTime = 0;
    this.sessionStart = Date.now();
  }

  // ── Private handlers (arrow functions for binding) ──

  _onClick = (e) => {
    const now = Date.now();
    this.clickCount++;

    if (this.lastClickTime > 0) {
      this.clickIntervals.push(now - this.lastClickTime);
    }
    this.lastClickTime = now;

    this.events.push({
      type: 'click',
      target: e.target.tagName,
      timestamp: now,
    });

    this._resetIdleTimer();
  };

  _onMouseMove = () => {
    this.mouseMoveCounter++;
    if (this.mouseMoveCounter % this.mouseSampleRate !== 0) return;
    this._resetIdleTimer();
  };

  _onVisibility = () => {
    if (document.hidden) {
      this.idleStart = Date.now();
    } else if (this.idleStart) {
      this.totalIdleTime += Date.now() - this.idleStart;
      this.idleStart = null;
    }
  };

  _resetIdleTimer() {
    if (this.idleStart) {
      this.totalIdleTime += Date.now() - this.idleStart;
      this.idleStart = null;
    }
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.idleStart = Date.now();
    }, 5000); // 5s idle threshold
  }
}

export const tracker = new EventTracker();
