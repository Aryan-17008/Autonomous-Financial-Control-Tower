const { v4: uuidv4 } = require('uuid');

class DecisionEngine {
  constructor() {
    this.recommendations = [];
  }

  process(alerts) {
    const recommendations = [];

    for (const alert of alerts) {
      if (alert.severity === 'CRITICAL') {
        recommendations.push({
          id: uuidv4(),
          type: 'BLOCK',
          action: `Block transaction ${alert.transaction_id}`,
          reason: alert.message,
          risk_score: 1.0,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } else if (alert.severity === 'HIGH') {
        recommendations.push({
          id: uuidv4(),
          type: 'REVIEW',
          action: `Review transaction ${alert.transaction_id}`,
          reason: alert.message,
          risk_score: 0.7,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
    }

    this.recommendations.push(...recommendations);
    return recommendations;
  }

  calculateRiskScore(alerts) {
    if (!alerts.length) return 0;
    const severityScores = { CRITICAL: 1.0, HIGH: 0.7, MEDIUM: 0.4, LOW: 0.1 };
    const total = alerts.reduce((sum, a) => sum + (severityScores[a.severity] || 0.1), 0);
    return Math.min(total / alerts.length, 1.0);
  }
}

module.exports = DecisionEngine;
