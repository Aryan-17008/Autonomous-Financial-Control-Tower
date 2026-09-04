import { Injectable } from '@nestjs/common';
import { Transaction, Alert, AlertType, Severity, AgentResult } from '../types';

/**
 * FraudAgent - analyzes a transaction for fraud signals
 * (high amounts, negative amounts).
 *
 * Registered as a NestJS injectable service so the orchestrator /
 * controllers can inject it via DI.
 */
@Injectable()
export class FraudAgent {
  private readonly anomalyThreshold = 2.0;

  analyze(transaction: Transaction): AgentResult {
    const alerts: Alert[] = [];
    let riskScore = 0;

    if (transaction.amount > 10000) {
      alerts.push({
        type: AlertType.HIGH_AMOUNT,
        severity: Severity.HIGH,
        message: `Transaction amount $${transaction.amount} exceeds threshold`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
      riskScore = Math.min(transaction.amount / 10000, 1.0);
    }

    if (transaction.amount < 0) {
      alerts.push({
        type: AlertType.NEGATIVE_AMOUNT,
        severity: Severity.CRITICAL,
        message: `Negative transaction amount detected: $${transaction.amount}`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
      riskScore = 1.0;
    }

    return {
      agent_name: 'FraudAgent',
      alerts,
      risk_score: riskScore,
      analysis: `Fraud check complete for ${transaction.id}`
    };
  }
}

export default FraudAgent;
