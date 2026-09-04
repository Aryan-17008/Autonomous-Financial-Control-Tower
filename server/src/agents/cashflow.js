class CashFlowAgent {
  constructor() {
    this.name = 'CashFlowAgent';
    this.balance = 100000;
  }

  analyze(transaction) {
    const alerts = [];
    let riskScore = 0;

    this.balance -= transaction.amount;

    if (this.balance < 20000) {
      alerts.push({
        type: 'LOW_BALANCE',
        severity: 'HIGH',
        message: `Balance dropping low: $${this.balance}`,
        transaction_id: transaction.id
      });
    }

    if (transaction.amount > 50000) {
      alerts.push({
        type: 'LARGE_OUTFLOW',
        severity: 'MEDIUM',
        message: `Large cash outflow: $${transaction.amount}`,
        transaction_id: transaction.id
      });
    }

    riskScore = Math.max(0, (50000 - this.balance) / 50000);

    return {
      agent_name: this.name,
      alerts,
      risk_score: riskScore,
      analysis: `Cash flow check. Current balance: $${this.balance}`
    };
  }
}

module.exports = CashFlowAgent;
