# 🏦 Financial Control Tower

AI-powered financial monitoring app for the hackathon. Mobile-first (React Native/Expo) with a Node.js/Express backend.

## Architecture

```
┌─────────────────────────────────────────┐
│           Orchestrator                  │
└────────────────────────┬────────────────┘
                         │
    ┌────────────────────┼───────────────────┐
    ▼                    ▼                   ▼
┌─────────┐        ┌───────────┐        ┌───────────┐
│  Fraud  │        │ Cash Flow │        │Compliance │
│  Agent  │        │   Agent   │        │   Agent   │
└─────────┘        └───────────┘        └───────────┘
                         │
                         ▼
            ┌─────────────────────┐
            │   Decision Engine   │
            └─────────┬───────────┘
                      ▼
            ┌─────────────────────┐
            │   Recommendations   │
            │       / Audit       │
            └─────────────────────┘
```

## Project Structure

```
financial-control-tower/
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── index.js       # Express entry point
│   │   ├── seed.js        # Sample data generator
│   │   ├── agents/        # Predictive agents
│   │   │   ├── fraud.js
│   │   │   ├── cashflow.js
│   │   │   └── compliance.js
│   │   ├── engine/        # Decision engine
│   │   │   └── decision.js
│   │   ├── routes/        # API routes
│   │   │   └── transactions.js
│   │   └── db/
│   │       └── database.js # SQLite config
│   └── package.json
└── mobile/                 # React Native (Expo) app
    ├── App.js             # Navigation setup
    ├── screens/
    │   ├── DashboardScreen.js
    │   ├── AlertsScreen.js
    │   ├── RecommendationsScreen.js
    │   └── AuditScreen.js
    └── src/
        └── api.js         # API client
```

## Setup

### Backend

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:3000`

### Mobile App

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go to run on your phone.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/analyze` | Analyze transactions, generate alerts + recommendations |
| GET | `/api/alerts` | Get all active alerts |
| GET | `/api/recommendations` | Get pending recommendations |
| POST | `/api/execute/:id` | Execute a recommendation |
| GET | `/api/audit` | Get audit trail |
| GET | `/api/transactions` | Get all transactions |

## Team Roles

| Member | Role | Works On |
|--------|------|----------|
| Lead | Architecture, Integration | Orchestrator, API |
| Nikhil | Backend + AI | Agents, routes, DB |
| Nayan | Decision Engine | engine/decision.js |
| Rishika | Mobile Frontend | mobile/screens/* |
| Shubham | UI/UX Design | Styling, navigation |
| Uma | PPT/Docs | Slides, demo script |
| Bhakti | Research | Competitive analysis |
