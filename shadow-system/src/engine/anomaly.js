// ══════════════════════════════════════════
// Shadow System — Anomaly Detection Engine
// Weighted deviation scoring with
// explainability and risk classification.
// ══════════════════════════════════════════

/**
 * Feature weights for anomaly scoring.
 * These determine how much each behavioral
 * feature contributes to the final risk score.
 */
const WEIGHTS = {
  clickRate: 0.25,
  sessionDuration: 0.20,
  navEntropy: 0.30,
  idleRatio: 0.15,
  clickInterval: 0.10,
};

/**
 * Risk level thresholds
 */
const RISK_LEVELS = {
  NORMAL: { max: 35, label: 'Normal', color: 'green' },
  SUSPICIOUS: { max: 65, label: 'Suspicious', color: 'amber' },
  HIGH: { max: 100, label: 'High Risk', color: 'red' },
};

/**
 * Calculate deviation between current value and baseline.
 * Returns a value between 0 (identical) and 1 (completely different).
 */
function calcDeviation(current, baseline) {
  if (baseline === 0) return current > 0 ? 1 : 0;
  const dev = Math.abs(current - baseline) / baseline;
  return Math.min(dev, 1); // Cap at 1 (100% deviation)
}

/**
 * Analyze current session against baseline.
 * Returns risk score, level, and explanations.
 */
export function analyzeAnomaly(currentFeatures, baseline) {
  const deviations = {};
  const explanations = [];

  // 1. Click Rate deviation
  deviations.clickRate = calcDeviation(currentFeatures.clickRate, baseline.avgClickRate);
  if (deviations.clickRate > 0.4) {
    const pct = Math.round(deviations.clickRate * 100);
    const dir = currentFeatures.clickRate > baseline.avgClickRate ? 'above' : 'below';
    explanations.push({
      feature: 'Click Rate',
      severity: deviations.clickRate > 0.7 ? 'high' : 'medium',
      message: `Click rate ${pct}% ${dir} baseline (${currentFeatures.clickRate} vs ${baseline.avgClickRate} clicks/min)`,
    });
  }

  // 2. Session Duration deviation
  deviations.sessionDuration = calcDeviation(currentFeatures.sessionDuration, baseline.avgSessionDuration);
  if (deviations.sessionDuration > 0.4) {
    const pct = Math.round(deviations.sessionDuration * 100);
    const dir = currentFeatures.sessionDuration > baseline.avgSessionDuration ? 'longer' : 'shorter';
    explanations.push({
      feature: 'Session Duration',
      severity: deviations.sessionDuration > 0.7 ? 'high' : 'medium',
      message: `Session ${pct}% ${dir} than normal (${currentFeatures.sessionDuration}s vs ${baseline.avgSessionDuration}s)`,
    });
  }

  // 3. Navigation Entropy deviation
  deviations.navEntropy = calcDeviation(currentFeatures.navEntropy, baseline.avgNavEntropy);
  if (deviations.navEntropy > 0.3) {
    const pct = Math.round(deviations.navEntropy * 100);
    explanations.push({
      feature: 'Navigation Pattern',
      severity: deviations.navEntropy > 0.6 ? 'high' : 'medium',
      message: `Navigation entropy deviated ${pct}% from baseline pattern`,
    });
  }

  // 4. Idle Ratio deviation
  deviations.idleRatio = calcDeviation(currentFeatures.idleRatio, baseline.avgIdleRatio);
  if (deviations.idleRatio > 0.5) {
    const pct = Math.round(deviations.idleRatio * 100);
    explanations.push({
      feature: 'Idle Time',
      severity: deviations.idleRatio > 0.7 ? 'high' : 'medium',
      message: `Idle ratio deviated ${pct}% from normal pattern`,
    });
  }

  // 5. Click Interval deviation
  deviations.clickInterval = calcDeviation(currentFeatures.avgClickInterval, baseline.avgClickInterval);
  if (deviations.clickInterval > 0.5) {
    const pct = Math.round(deviations.clickInterval * 100);
    explanations.push({
      feature: 'Click Rhythm',
      severity: deviations.clickInterval > 0.7 ? 'high' : 'medium',
      message: `Click timing pattern ${pct}% different from baseline`,
    });
  }

  // ── Weighted score calculation ──
  let rawScore = 0;
  for (const [feature, weight] of Object.entries(WEIGHTS)) {
    rawScore += (deviations[feature] || 0) * weight;
  }

  // Convert to 0-100 scale
  const riskScore = Math.min(Math.round(rawScore * 100), 100);

  // Determine risk level
  let riskLevel;
  if (riskScore <= RISK_LEVELS.NORMAL.max) {
    riskLevel = RISK_LEVELS.NORMAL;
  } else if (riskScore <= RISK_LEVELS.SUSPICIOUS.max) {
    riskLevel = RISK_LEVELS.SUSPICIOUS;
  } else {
    riskLevel = RISK_LEVELS.HIGH;
  }

  // Sort explanations by severity
  explanations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });

  return {
    riskScore,
    riskLevel,
    deviations,
    explanations,
    currentFeatures,
    baseline,
    timestamp: Date.now(),
  };
}

/**
 * Generate simulated anomalous behavior features.
 * Used in Simulation Mode for demo purposes.
 */
export function generateSimulatedAnomaly(type, baseline) {
  const base = { ...baseline };

  switch (type) {
    case 'bot':
      return {
        clickRate: base.avgClickRate * 4.5,
        sessionDuration: base.avgSessionDuration * 0.2,
        navEntropy: 0.95,
        idleRatio: 0.01,
        avgClickInterval: base.avgClickInterval * 0.1,
        navSequence: 'dashboard → analytics → simulation → dashboard → analytics',
        pageCount: 20,
        totalClicks: 200,
      };

    case 'credential':
      return {
        clickRate: base.avgClickRate * 0.3,
        sessionDuration: base.avgSessionDuration * 3,
        navEntropy: 0.2,
        idleRatio: 0.7,
        avgClickInterval: base.avgClickInterval * 5,
        navSequence: 'settings → settings → settings',
        pageCount: 2,
        totalClicks: 5,
      };

    case 'insider':
      return {
        clickRate: base.avgClickRate * 1.6,
        sessionDuration: base.avgSessionDuration * 1.5,
        navEntropy: 0.85,
        idleRatio: base.avgIdleRatio * 0.3,
        avgClickInterval: base.avgClickInterval * 0.6,
        navSequence: 'dashboard → analytics → settings → dashboard → simulation',
        pageCount: 12,
        totalClicks: 45,
      };

    default:
      return {
        clickRate: base.avgClickRate,
        sessionDuration: base.avgSessionDuration,
        navEntropy: base.avgNavEntropy,
        idleRatio: base.avgIdleRatio,
        avgClickInterval: base.avgClickInterval,
        navSequence: base.commonNavSequence,
        pageCount: 5,
        totalClicks: 15,
      };
  }
}
