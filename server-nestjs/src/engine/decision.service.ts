import { Alert, Severity, Recommendation, RecommendationType, RecommendationStatus } from './types';
import { randomUUID } from 'crypto';

export class DecisionService {
  private readonly severityScores: Record<Severity, number> = {
    [Severity.CRITICAL]: 1.0,
    [Severity.HIGH]: 0.7,
    [Severity.MEDIUM]: 0.4,
    [Severity.LOW]: 0.1
  };

  process(alerts: Alert[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const alert of alerts) {
      if (alert.severity === Severity.CRITICAL) {
        recommendations.push({
          id: randomUUID(),
          type: RecommendationType.BLOCK,
          action: `Block transaction ${alert.transaction_id}`,
          reason: alert.message,
          risk_score: 1.0,
          status: RecommendationStatus.PENDING,
          created_at: new Date().toISOString()
        });
      } else if (alert.severity === Severity.HIGH) {
        recommendations.push({
          id: randomUUID(),
          type: RecommendationType.REVIEW,
          action: `Review transaction ${alert.transaction_id}`,
          reason: alert.message,
          risk_score: 0.7,
          status: RecommendationStatus.PENDING,
          created_at: new Date().toISOString()
        });
      }
    }

    return recommendations;
  }

  calculateRiskScore(alerts: Alert[]): number {
    if (!alerts.length) return 0;
    const total = alerts.reduce((sum, a) => sum + (this.severityScores[a.severity] || 0.1), 0);
    return Math.min(total / alerts.length, 1.0);
  }
}

export default DecisionService;
