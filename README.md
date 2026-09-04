# 🏦 Financial Control Tower

AI-powered financial monitoring system for the hackathon.

## Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd financial-control-tower

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the backend
cd app
uvicorn main:app --reload --port 8000

# Run the frontend (new terminal)
cd frontend
streamlit run streamlit_app.py
```

## Team Structure

| Member | Role | Files |
|--------|------|-------|
| Lead | Architecture, Orchestrator | `app/orchestrator.py`, `app/main.py` |
| Nikhil | Backend + Fraud | `app/agents/fraud_agent.py`, `app/database.py` |
| Nayan | Decision Engine | `app/engine/decision.py` |
| Rishika | Frontend | `frontend/streamlit_app.py` |
| Shubham | UI/UX | `frontend/styles.css` |

## API Endpoints

- `GET /` - Health check
- `POST /analyze` - Analyze transactions
- `GET /recommendations` - Get recommendations
- `POST /execute/{id}` - Execute recommendation
- `GET /audit` - Audit trail

## Architecture

```
┌─────────────────────────────────────────┐
│           Orchestrator                  │
│      (Coordinates all agents)          │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│ Fraud  │    │   Cash   │    │Compliance│
│ Agent  │    │   Flow   │    │  Agent   │
└────────┘    └──────────┘    └──────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Decision Engine │
           └─────────────────┘
```
