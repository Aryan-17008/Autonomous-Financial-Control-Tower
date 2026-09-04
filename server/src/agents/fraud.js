class FraudAgent {
  constructor() {
    this.name = 'FraudAgent';
    this.anomalyThreshold = 2.0;
  }

  analyze(transaction) {
    const alerts = [];
    let riskScore = 0;

    if (transaction.amount > 10000) {
      alerts.push({
        type: 'HIGH_AMOUNT',
        severity: 'HIGH',
        message: `Transaction amount $${transaction.amount} exceeds threshold`,
        transaction_id: transaction.id
      });
      riskScore = Math.min(transaction.amount / 10000, 1.0);
    }

    if (transaction.amount < 0) {
      alerts.push({
        type: 'NEGATIVE_AMOUNT',
        severity: 'CRITICAL',
        message: `Negative transaction amount detected: $${transaction.amount}`,
        transaction_id: transaction.id
      });
      riskScore = 1.0;
    }

    return {
      agent_name: this.name,
      alerts,
      risk_score: riskScore,
      analysis: `Fraud check complete for ${transaction.id}`
    };
  }
}

module.exports = FraudAgent;
