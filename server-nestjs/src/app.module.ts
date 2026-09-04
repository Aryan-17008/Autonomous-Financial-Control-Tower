import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudAgent } from './agents/fraud.service';
import { CashFlowAgent } from './agents/cashflow.service';
import { ComplianceAgent } from './agents/compliance.service';
import { DecisionService } from './engine/decision.service';
import { OrchestratorService } from './orchestrator.service';
import { TransactionsController } from './controllers/transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { Alert } from './entities/alert.entity';
import { Recommendation } from './entities/recommendation.entity';
import { AuditLog } from './entities/audit.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/financial.db',
      entities: [Transaction, Alert, Recommendation, AuditLog, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Transaction, Alert, Recommendation, AuditLog, User]),
  ],
  controllers: [TransactionsController],
  providers: [
    OrchestratorService,
    DecisionService,
    FraudAgent,
    CashFlowAgent,
    ComplianceAgent,
  ],
  exports: [OrchestratorService],
})
export class AppModule {}
