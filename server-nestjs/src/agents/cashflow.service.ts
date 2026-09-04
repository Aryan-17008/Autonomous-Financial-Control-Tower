import { Transaction, Alert, Severity, AgentResult } from './types';

export class CashFlowAgent {
  private balance = 100000;

  analyze(transaction: Transaction): AgentResult {
    const alerts: Alert[] = [];
    let riskScore = 0;

    this.balance -= transaction.amount;

    if (this.balance < 20000) {
      alerts.push({
        type: 'LOW_BALANCE',
        severity: Severity.HIGH,
        message: `Balance dropping low: $${this.balance}`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
    }

    if (transaction.amount > 50000) {
      alerts.push({
        type: 'LARGE_OUTFLOW',
        severity: Severity.MEDIUM,
        message: `Large cash outflow: $${transaction.amount}`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
    }

    riskScore = Math.max(0, (50000 - this.balance) / 50000);

    return {
      agent_name: 'CashFlowAgent',
      alerts,
      risk_score: riskScore,
      analysis: `Cash flow check. Current balance: $${this.balance}`
    };
  }
}

export default CashFlowAgent;
