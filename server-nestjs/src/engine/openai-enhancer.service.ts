import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Alert, Recommendation } from '../types';

/**
 * Optional OpenAI enhancement for the decision engine.
 *
 * The rules-based DecisionService stays the source of truth for the
 * recommendation TYPE (BLOCK / REVIEW / APPROVE). This enhancer only
 * rewrites the human-readable `reason` and refines `risk_score` using
 * a cheap chat model.
 *
 * Behavior without an OPENAI_API_KEY (or on any API/parse error):
 * recommendations are returned unchanged. This service NEVER throws.
 */
@Injectable()
export class OpenAiEnhancerService {
  private readonly logger = new Logger(OpenAiEnhancerService.name);
  private readonly client: OpenAI | null = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
  private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  get enabled(): boolean {
    return this.client !== null;
  }

  /**
   * Rewrite `reason` / refine `risk_score` on each recommendation.
   * Falls back to the original list whenever anything goes wrong.
   */
  async enhance(alerts: Alert[], recommendations: Recommendation[]): Promise<Recommendation[]> {
    if (!this.client || !recommendations.length) {
      return recommendations;
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a financial risk analyst. You receive alerts and draft recommendations. ' +
              'Respond with strict JSON: {"enhancements":[{"index":0,"reason":"...","risk_score":0.0}]} ' +
              'risk_score must be a number between 0 and 1. Keep reasons under 200 characters.',
          },
          {
            role: 'user',
            content: JSON.stringify({ alerts, recommendations }),
          },
        ],
        temperature: 0.2,
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) return recommendations;

      const parsed = JSON.parse(raw) as {
        enhancements?: { index: number; reason?: string; risk_score?: number }[];
      };

      const byIndex = new Map((parsed.enhancements ?? []).map((e) => [e.index, e]));
      return recommendations.map((rec, index) => {
        const e = byIndex.get(index);
        if (!e) return rec;
        const riskOk = typeof e.risk_score === 'number' && e.risk_score >= 0 && e.risk_score <= 1;
        return {
          ...rec,
          reason: typeof e.reason === 'string' && e.reason.trim() ? e.reason : rec.reason,
          risk_score: riskOk ? e.risk_score : rec.risk_score,
        };
      });
    } catch (err) {
      this.logger.warn(`OpenAI enhancement skipped: ${(err as Error).message}`);
      return recommendations;
    }
  }
}
