import { Injectable, Optional } from '@nestjs/common';
import { Alert, Severity, Recommendation, RecommendationType, RecommendationStatus } from '../types';
import { randomUUID } from 'crypto';
import { OpenAiEnhancerService } from './openai-enhancer.service';

/**
 * DecisionService - turns agent alerts into actionable recommendations
 * (BLOCK / REVIEW / APPROVE). Registered as an injectable provider so
 * the orchestrator can compose it with the agents via DI.
 *
 * process() is synchronous and rules-based (deterministic, offline).
 * processSmart() additionally rewrites reasons / risk scores via the
 * optional OpenAI enhancer when OPENAI_API_KEY is configured.
 */
@Injectable()
export class DecisionService {
  constructor(
    @Optional() private readonly aiEnhancer?: OpenAiEnhancerService,
  ) {}
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

  /**
   * Rules-based recommendations, then optional OpenAI polish of the
   * reason text and risk scores. Without an API key (or on failure)
   * this is exactly equivalent to process().
   */
  async processSmart(alerts: Alert[]): Promise<Recommendation[]> {
    const recommendations = this.process(alerts);
    if (!this.aiEnhancer?.enabled) {
      return recommendations;
    }
    return this.aiEnhancer.enhance(alerts, recommendations);
  }

  calculateRiskScore(alerts: Alert[]): number {
    if (!alerts.length) return 0;
    const total = alerts.reduce((sum, a) => sum + (this.severityScores[a.severity] || 0.1), 0);
    return Math.min(total / alerts.length, 1.0);
  }
}

export default DecisionService;
