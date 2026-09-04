from datetime import datetime
from typing import List
from models import Alert, AgentResult


class FraudAgent:
    def __init__(self):
        self.name = "FraudAgent"
        self.anomaly_threshold = 2.0
    
    def analyze(self, transaction) -> AgentResult:
        alerts = []
        
        if transaction.amount > 10000:
            alerts.append(Alert(
                type="HIGH_AMOUNT",
                severity="HIGH",
                message=f"Transaction amount ${transaction.amount} exceeds threshold",
                transaction_id=transaction.id
            ))
        
        if transaction.amount < 0:
            alerts.append(Alert(
                type="NEGATIVE_AMOUNT",
                severity="CRITICAL",
                message=f"Negative transaction amount detected: ${transaction.amount}",
                transaction_id=transaction.id
            ))
        
        risk_score = min(transaction.amount / 10000, 1.0)
        
        return AgentResult(
            agent_name=self.name,
            alerts=alerts,
            risk_score=risk_score,
            analysis=f"Fraud check complete for transaction {transaction.id}"
        )
