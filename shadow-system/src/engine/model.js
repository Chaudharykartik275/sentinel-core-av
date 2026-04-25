// ══════════════════════════════════════════
// Shadow System — Behavior Model (Digital Twin)
// Stores and manages baseline behavioral
// profiles for each user.
// ══════════════════════════════════════════

const STORAGE_KEY = 'shadow_behavior_model';

class BehaviorModel {
  constructor() {
    this.profiles = this._load();
  }

  /**
   * Get the baseline profile for a user.
   * Returns default if cold-start (new user).
   */
  getBaseline(userId) {
    if (this.profiles[userId] && this.profiles[userId].sessionCount >= 3) {
      return this.profiles[userId];
    }
    // Cold-start: return generic baseline
    return {
      avgClickRate: 15,
      avgSessionDuration: 300,
      avgNavEntropy: 0.6,
      avgIdleRatio: 0.15,
      avgClickInterval: 2000,
      commonNavSequence: 'dashboard → analytics → simulation',
      sessionCount: 0,
      isColdStart: true,
    };
  }

  /**
   * Update the user's baseline with new session data.
   * Uses exponential moving average for adaptive learning.
   */
  updateBaseline(userId, sessionFeatures) {
    const existing = this.profiles[userId];
    const alpha = 0.3; // Learning rate: how much new data influences the model

    if (!existing || existing.sessionCount < 1) {
      // First session — set baseline directly
      this.profiles[userId] = {
        avgClickRate: sessionFeatures.clickRate,
        avgSessionDuration: sessionFeatures.sessionDuration,
        avgNavEntropy: sessionFeatures.navEntropy,
        avgIdleRatio: sessionFeatures.idleRatio,
        avgClickInterval: sessionFeatures.avgClickInterval,
        commonNavSequence: sessionFeatures.navSequence,
        sessionCount: 1,
        lastUpdated: Date.now(),
      };
    } else {
      // Adaptive update (exponential moving average)
      this.profiles[userId] = {
        avgClickRate: this._ema(existing.avgClickRate, sessionFeatures.clickRate, alpha),
        avgSessionDuration: this._ema(existing.avgSessionDuration, sessionFeatures.sessionDuration, alpha),
        avgNavEntropy: this._ema(existing.avgNavEntropy, sessionFeatures.navEntropy, alpha),
        avgIdleRatio: this._ema(existing.avgIdleRatio, sessionFeatures.idleRatio, alpha),
        avgClickInterval: this._ema(existing.avgClickInterval, sessionFeatures.avgClickInterval, alpha),
        commonNavSequence: sessionFeatures.navSequence,
        sessionCount: existing.sessionCount + 1,
        lastUpdated: Date.now(),
      };
    }

    this._save();
    return this.profiles[userId];
  }

  /** Get all stored profiles */
  getAllProfiles() {
    return { ...this.profiles };
  }

  /** Reset a user's profile */
  resetProfile(userId) {
    delete this.profiles[userId];
    this._save();
  }

  // ── Private ──

  /** Exponential moving average */
  _ema(oldVal, newVal, alpha) {
    return Math.round((alpha * newVal + (1 - alpha) * oldVal) * 100) / 100;
  }

  _load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('[Model] Failed to save:', e);
    }
  }
}

export const behaviorModel = new BehaviorModel();
