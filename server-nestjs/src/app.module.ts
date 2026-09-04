import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { FraudAgent } from './agents/fraud.service';
import { CashFlowAgent } from './agents/cashflow.service';
import { ComplianceAgent } from './agents/compliance.service';
import { DecisionService } from './engine/decision.service';
import { OpenAiEnhancerService } from './engine/openai-enhancer.service';
import { OrchestratorService } from './services/orchestrator.service';
import { TransactionsController } from './controllers/transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { Alert } from './entities/alert.entity';
import { Recommendation } from './entities/recommendation.entity';
import { AuditLog } from './entities/audit.entity';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';

/**
 * Root module. TypeORM is configured with SQLite at data/financial.db.
 * synchronize:true is a dev convenience (schema auto-created); switch to
 * migrations before production.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(__dirname, '..', 'data', 'financial.db'),
      entities: [Transaction, Alert, Recommendation, AuditLog, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Transaction, Alert, Recommendation, AuditLog, User]),
    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [
    FraudAgent,
    CashFlowAgent,
    ComplianceAgent,
    DecisionService,
    OpenAiEnhancerService,
    OrchestratorService,
  ],
})
export class AppModule {}
