from datetime import datetime
from typing import List
from models import Alert, AgentResult


class ComplianceAgent:
    def __init__(self):
        self.name = "ComplianceAgent"
        self.transaction_limit = 50000
        self.blocked_vendors = ["VENDOR_BLOCKED_1", "VENDOR_BLOCKED_2"]
    
    def analyze(self, transaction) -> AgentResult:
        alerts = []
        
        if transaction.amount > self.transaction_limit:
            alerts.append(Alert(
                type="LIMIT_EXCEEDED",
                severity="HIGH",
                message=f"Transaction exceeds limit of ${self.transaction_limit}",
                transaction_id=transaction.id
            ))
        
        if transaction.counterparty_id in self.blocked_vendors:
            alerts.append(Alert(
                type="BLOCKED_COUNTERPARTY",
                severity="CRITICAL",
                message=f"Transaction with blocked vendor: {transaction.counterparty_id}",
                transaction_id=transaction.id
            ))
        
        risk_score = 1.0 if transaction.amount > self.transaction_limit else 0.0
        
        return AgentResult(
            agent_name=self.name,
            alerts=alerts,
            risk_score=risk_score,
            analysis=f"Compliance check complete for {transaction.id}"
        )
