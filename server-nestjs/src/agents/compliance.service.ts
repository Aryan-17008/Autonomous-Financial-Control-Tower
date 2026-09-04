import { Transaction, Alert, Severity, AgentResult } from './types';

export class ComplianceAgent {
  private readonly transactionLimit = 50000;
  private readonly blockedVendors = ['VENDOR_BLOCKED_1', 'VENDOR_BLOCKED_2'];

  analyze(transaction: Transaction): AgentResult {
    const alerts: Alert[] = [];
    let riskScore = 0;

    if (transaction.amount > this.transactionLimit) {
      alerts.push({
        type: 'LIMIT_EXCEEDED',
        severity: Severity.HIGH,
        message: `Transaction exceeds limit of $${this.transactionLimit}`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
      riskScore = 1.0;
    }

    if (this.blockedVendors.includes(transaction.counterparty_id)) {
      alerts.push({
        type: 'BLOCKED_COUNTERPARTY',
        severity: Severity.CRITICAL,
        message: `Transaction with blocked vendor: ${transaction.counterparty_id}`,
        transaction_id: transaction.id,
        timestamp: new Date().toISOString()
      });
      riskScore = 1.0;
    }

    return {
      agent_name: 'ComplianceAgent',
      alerts,
      risk_score: riskScore,
      analysis: `Compliance check complete for ${transaction.id}`
    };
  }
}

export default ComplianceAgent;
