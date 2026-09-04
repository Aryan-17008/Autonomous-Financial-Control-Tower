# Financial Control Tower - NestJS Backend

## Task Ownership

| Member | Scope |
|--------|-------|
| **You** | Decision Service, Orchestrator, Transaction controller, DB schema |
| **Nikhil** | Fraud Agent, CashFlow Agent, Compliance Agent, mobile screens |

## Project Structure

```
server-nestjs/src/
├── types.ts                  # Shared domain types (ALREADY PROVIDED)
├── agents/
│   ├── fraud.service.ts       # FraudAgent (Nikhil)
│   ├── cashflow.service.ts    # CashFlowAgent (Nikhil)
│   └── compliance.service.ts  # ComplianceAgent (Nikhil)
├── engine/
│   └── decision.service.ts    # DecisionService (You)
├── auth/                      # Auth module (Nayan - login/register/JWT)
└── (controllers, entities, dtos)  # To be scaffolded
```

## Shared Types Contract (DO NOT CHANGE)

All agents **must** return `AgentResult`:
```ts
{
  agent_name: string;
  alerts: Alert[];   // { type, severity, message, transaction_id, timestamp }
  risk_score: number;
  analysis: string;
}
```

## Setup

```bash
cd server-nestjs
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/typeorm typeorm sqlite3
npm install -D @nestjs/cli typescript ts-node @types/node
```

## Coordination Points

1. **Nikhil**: Your 3 agents return `AgentResult` (already written). Wire them into NestJS as injectable services.
2. **You**: Build the Orchestrator that calls all 3 agents, feeds DecisionService, and saves via controllers.
3. **Nayan**: Auth module - user login/register + JWT. Share token format so agents' routes can be protected.

## To Build Next
- NestJS app module (root `AppModule`)
- `TransactionController` with `/analyze`, `/alerts`, `/recommendations`, `/execute/:id`, `/audit`
- TypeORM entities for Transaction, Alert, Recommendation, AuditLog, User
- Auth (Nayan)
