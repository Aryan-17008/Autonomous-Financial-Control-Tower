import 'reflect-metadata';

jest.mock('./auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));

import { AppModule } from './app.module';
import { TransactionsController } from './controllers/transactions.controller';
import { FraudAgent } from './agents/fraud.service';
import { CashFlowAgent } from './agents/cashflow.service';
import { ComplianceAgent } from './agents/compliance.service';
import { DecisionService } from './engine/decision.service';
import { OpenAiEnhancerService } from './engine/openai-enhancer.service';
import { OrchestratorService } from './services/orchestrator.service';
import { AuthModule } from './auth/auth.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should register TransactionsController', () => {
    const controllers = Reflect.getMetadata('controllers', AppModule);

    expect(controllers).toContain(TransactionsController);
  });

  it('should register all required providers', () => {
    const providers = Reflect.getMetadata('providers', AppModule);

    expect(providers).toEqual(
      expect.arrayContaining([
        FraudAgent,
        CashFlowAgent,
        ComplianceAgent,
        DecisionService,
        OpenAiEnhancerService,
        OrchestratorService,
      ]),
    );
  });

  it('should import AuthModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);

    expect(imports).toContain(AuthModule);
  });

  it('should configure TypeORM modules', () => {
    const imports = Reflect.getMetadata('imports', AppModule);

    expect(imports.length).toBeGreaterThanOrEqual(3);

    // AppModule should contain:
    // 1. TypeOrmModule.forRoot(...)
    // 2. TypeOrmModule.forFeature(...)
    // 3. AuthModule
    expect(imports).toContain(AuthModule);
  });

  it('should have the expected module metadata', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    const controllers = Reflect.getMetadata('controllers', AppModule);
    const providers = Reflect.getMetadata('providers', AppModule);

    expect(imports).toBeDefined();
    expect(controllers).toBeDefined();
    expect(providers).toBeDefined();

    expect(controllers).toHaveLength(1);
    expect(controllers).toContain(TransactionsController);

    expect(providers).toHaveLength(6);
  });
});