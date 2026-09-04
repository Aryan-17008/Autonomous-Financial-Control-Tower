from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from agents.fraud_agent import FraudAgent
from agents.cashflow_agent import CashFlowAgent
from agents.compliance_agent import ComplianceAgent
from engine.decision import DecisionEngine
from audit.logger import AuditLogger

app = FastAPI(title="Financial Control Tower", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fraud_agent = FraudAgent()
cashflow_agent = CashFlowAgent()
compliance_agent = ComplianceAgent()
decision_engine = DecisionEngine()
audit_logger = AuditLogger()


class Transaction(BaseModel):
    id: str
    amount: float
    currency: str
    vendor: str
    timestamp: datetime
    category: str
    counterparty_id: str


class AnalysisRequest(BaseModel):
    transactions: List[Transaction]


class AnalysisResponse(BaseModel):
    risk_score: float
    alerts: List[dict]
    recommendations: List[dict]


@app.get("/")
async def root():
    return {"status": "healthy", "service": "Financial Control Tower"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_transactions(request: AnalysisRequest):
    all_alerts = []
    
    for tx in request.transactions:
        fraud_result = fraud_agent.analyze(tx)
        cashflow_result = cashflow_agent.analyze(tx)
        compliance_result = compliance_agent.analyze(tx)
        
        all_alerts.extend(fraud_result.alerts)
        all_alerts.extend(cashflow_result.alerts)
        all_alerts.extend(compliance_result.alerts)
    
    recommendations = decision_engine.process(all_alerts)
    risk_score = decision_engine.calculate_risk_score(all_alerts)
    
    for rec in recommendations:
        audit_logger.log(rec)
    
    return AnalysisResponse(
        risk_score=risk_score,
        alerts=all_alerts,
        recommendations=recommendations
    )


@app.get("/recommendations")
async def get_recommendations():
    return {"recommendations": audit_logger.get_pending_recommendations()}


@app.post("/execute/{recommendation_id}")
async def execute_recommendation(recommendation_id: str):
    result = audit_logger.execute(recommendation_id)
    return {"status": "executed", "recommendation_id": recommendation_id, "result": result}


@app.get("/audit")
async def get_audit_trail():
    return {"audit_trail": audit_logger.get_all()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
