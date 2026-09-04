from typing import List
from models import Recommendation
import uuid


class DecisionEngine:
    def __init__(self):
        self.recommendations = []
    
    def process(self, alerts: List[dict]) -> List[Recommendation]:
        recommendations = []
        
        for alert in alerts:
            if alert.get("severity") == "CRITICAL":
                recommendations.append(Recommendation(
                    id=str(uuid.uuid4()),
                    type="BLOCK",
                    action=f"Block transaction {alert.get('transaction_id')}",
                    reason=alert.get("message"),
                    risk_score=1.0
                ))
            elif alert.get("severity") == "HIGH":
                recommendations.append(Recommendation(
                    id=str(uuid.uuid4()),
                    type="REVIEW",
                    action=f"Review transaction {alert.get('transaction_id')}",
                    reason=alert.get("message"),
                    risk_score=0.7
                ))
        
        self.recommendations.extend(recommendations)
        return recommendations
    
    def calculate_risk_score(self, alerts: List[dict]) -> float:
        if not alerts:
            return 0.0
        
        severity_scores = {"CRITICAL": 1.0, "HIGH": 0.7, "MEDIUM": 0.4, "LOW": 0.1}
        total = sum(severity_scores.get(a.get("severity", "LOW"), 0) for a in alerts)
        return min(total / len(alerts), 1.0)
