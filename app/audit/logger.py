from datetime import datetime
from typing import List, Dict
import uuid


class AuditLogger:
    def __init__(self):
        self.log_entries = []
        self.recommendations = {}
    
    def log(self, recommendation):
        entry = {
            "id": str(uuid.uuid4()),
            "recommendation_id": recommendation.id,
            "type": recommendation.type,
            "action": recommendation.action,
            "reason": recommendation.reason,
            "risk_score": recommendation.risk_score,
            "status": "logged",
            "timestamp": datetime.now().isoformat()
        }
        self.log_entries.append(entry)
        self.recommendations[recommendation.id] = recommendation
    
    def get_all(self) -> List[Dict]:
        return self.log_entries
    
    def get_pending_recommendations(self) -> List[Dict]:
        pending = []
        for rec_id, rec in self.recommendations.items():
            if rec.status == "pending":
                pending.append({
                    "id": rec.id,
                    "type": rec.type,
                    "action": rec.action,
                    "reason": rec.reason,
                    "risk_score": rec.risk_score,
                    "status": rec.status
                })
        return pending
    
    def execute(self, recommendation_id: str) -> Dict:
        if recommendation_id in self.recommendations:
            rec = self.recommendations[recommendation_id]
            rec.status = "executed"
            return {"success": True, "action": rec.action}
        return {"success": False, "error": "Recommendation not found"}
