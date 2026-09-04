class ComplianceAgent {
  constructor() {
    this.name = 'ComplianceAgent';
    this.transactionLimit = 50000;
    this.blockedVendors = ['VENDOR_BLOCKED_1', 'VENDOR_BLOCKED_2'];
  }

  analyze(transaction) {
    const alerts = [];
    let riskScore = 0;

    if (transaction.amount > this.transactionLimit) {
      alerts.push({
        type: 'LIMIT_EXCEEDED',
        severity: 'HIGH',
        message: `Transaction exceeds limit of $${this.transactionLimit}`,
        transaction_id: transaction.id
      });
      riskScore = 1.0;
    }

    if (this.blockedVendors.includes(transaction.counterparty_id)) {
      alerts.push({
        type: 'BLOCKED_COUNTERPARTY',
        severity: 'CRITICAL',
        message: `Transaction with blocked vendor: ${transaction.counterparty_id}`,
        transaction_id: transaction.id
      });
      riskScore = 1.0;
    }

    return {
      agent_name: this.name,
      alerts,
      risk_score: riskScore,
      analysis: `Compliance check complete for ${transaction.id}`
    };
  }
}

module.exports = ComplianceAgent;
