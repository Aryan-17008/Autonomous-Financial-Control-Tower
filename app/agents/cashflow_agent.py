from datetime import datetime
from typing import List
from models import Alert, AgentResult


class CashFlowAgent:
    def __init__(self):
        self.name = "CashFlowAgent"
        self.balance = 100000
    
    def analyze(self, transaction) -> AgentResult:
        alerts = []
        
        self.balance -= transaction.amount
        
        if self.balance < 20000:
            alerts.append(Alert(
                type="LOW_BALANCE",
                severity="HIGH",
                message=f"Balance dropping low: ${self.balance}",
                transaction_id=transaction.id
            ))
        
        if transaction.amount > 50000:
            alerts.append(Alert(
                type="LARGE_OUTFLOW",
                severity="MEDIUM",
                message=f"Large cash outflow: ${transaction.amount}",
                transaction_id=transaction.id
            ))
        
        risk_score = max(0, (50000 - self.balance) / 50000)
        
        return AgentResult(
            agent_name=self.name,
            alerts=alerts,
            risk_score=risk_score,
            analysis=f"Cash flow check. Current balance: ${self.balance}"
        )
