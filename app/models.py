from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Alert(BaseModel):
    type: str
    severity: str
    message: str
    transaction_id: str
    timestamp: datetime = datetime.now()


class AgentResult(BaseModel):
    agent_name: str
    alerts: List[Alert]
    risk_score: float
    analysis: str


class Recommendation(BaseModel):
    id: str
    type: str
    action: str
    reason: str
    risk_score: float
    status: str = "pending"
    created_at: datetime = datetime.now()
