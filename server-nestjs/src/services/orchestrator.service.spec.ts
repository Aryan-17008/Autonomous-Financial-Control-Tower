import { OrchestratorService } from './orchestrator.service';
import { FraudAgent } from '../agents/fraud.service';
import { CashFlowAgent } from '../agents/cashflow.service';
import { ComplianceAgent } from '../agents/compliance.service';
import { DecisionService } from '../engine/decision.service';
import {
  Alert,
  AlertType,
  RecommendationStatus,
  RecommendationType,
  Severity,
  Transaction,
} from '../types';

describe('OrchestratorService', () => {
  let service: OrchestratorService;
  let fraudAgent: { analyze: jest.Mock };
  let cashflowAgent: { analyze: jest.Mock };
  let complianceAgent: { analyze: jest.Mock };
  let decisionService: {
    process: jest.Mock;
    calculateRiskScore: jest.Mock;
  };

  const transaction: Transaction = {
    id: 'txn_test_001',
    amount: 1000,
    currency: 'USD',
    vendor: 'Test Vendor',
    timestamp: '2026-09-05T00:00:00Z',
    category: 'transfer',
    counterparty_id: 'VENDOR_001',
  };

  const createAlert = (severity: Severity): Alert => ({
    type: AlertType.HIGH_AMOUNT,
    severity,
    message: 'Test alert',
    transaction_id: transaction.id,
    timestamp: '2026-09-05T00:00:00Z',
  });

  beforeEach(() => {
    fraudAgent = {
      analyze: jest.fn(),
    };

    cashflowAgent = {
      analyze: jest.fn(),
    };

    complianceAgent = {
      analyze: jest.fn(),
    };

    decisionService = {
      process: jest.fn(),
      calculateRiskScore: jest.fn(),
    };

    service = new OrchestratorService(
      fraudAgent as unknown as FraudAgent,
      cashflowAgent as unknown as CashFlowAgent,
      complianceAgent as unknown as ComplianceAgent,
      decisionService as unknown as DecisionService,
    );
  });

  describe('analyze', () => {
    it('should run all three agents for a transaction', () => {
      const fraudResult = {
        agent_name: 'FraudAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'Fraud check complete',
      };

      const cashflowResult = {
        agent_name: 'CashFlowAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'Cash flow check complete',
      };

      const complianceResult = {
        agent_name: 'ComplianceAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'Compliance check complete',
      };

      fraudAgent.analyze.mockReturnValue(fraudResult);
      cashflowAgent.analyze.mockReturnValue(cashflowResult);
      complianceAgent.analyze.mockReturnValue(complianceResult);

      const results = service.analyze(transaction);

      expect(fraudAgent.analyze).toHaveBeenCalledWith(transaction);
      expect(cashflowAgent.analyze).toHaveBeenCalledWith(transaction);
      expect(complianceAgent.analyze).toHaveBeenCalledWith(transaction);

      expect(results).toHaveLength(3);
      expect(results).toEqual([
        fraudResult,
        cashflowResult,
        complianceResult,
      ]);
    });

    it('should preserve alerts returned by each agent', () => {
      const fraudAlert = createAlert(Severity.HIGH);
      const cashflowAlert = createAlert(Severity.MEDIUM);
      const complianceAlert = createAlert(Severity.CRITICAL);

      fraudAgent.analyze.mockReturnValue({
        agent_name: 'FraudAgent',
        alerts: [fraudAlert],
        risk_score: 0.7,
        analysis: 'Fraud alert',
      });

      cashflowAgent.analyze.mockReturnValue({
        agent_name: 'CashFlowAgent',
        alerts: [cashflowAlert],
        risk_score: 0.4,
        analysis: 'Cash flow alert',
      });

      complianceAgent.analyze.mockReturnValue({
        agent_name: 'ComplianceAgent',
        alerts: [complianceAlert],
        risk_score: 1,
        analysis: 'Compliance alert',
      });

      const results = service.analyze(transaction);

      expect(results[0].alerts).toEqual([fraudAlert]);
      expect(results[1].alerts).toEqual([cashflowAlert]);
      expect(results[2].alerts).toEqual([complianceAlert]);
    });
  });

  describe('analyzeBatch', () => {
    it('should return empty results for an empty transaction list', () => {
      decisionService.process.mockReturnValue([]);
      decisionService.calculateRiskScore.mockReturnValue(0);

      const result = service.analyzeBatch([]);

      expect(result.alerts).toEqual([]);
      expect(result.recommendations).toEqual([]);
      expect(result.risk_score).toBe(0);

      expect(decisionService.process).toHaveBeenCalledWith([]);
      expect(decisionService.calculateRiskScore).toHaveBeenCalledWith([]);
    });

    it('should aggregate alerts from all agents', () => {
      const fraudAlert = createAlert(Severity.HIGH);
      const complianceAlert = createAlert(Severity.CRITICAL);

      fraudAgent.analyze.mockReturnValue({
        agent_name: 'FraudAgent',
        alerts: [fraudAlert],
        risk_score: 0.7,
        analysis: 'Fraud alert',
      });

      cashflowAgent.analyze.mockReturnValue({
        agent_name: 'CashFlowAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'No alert',
      });

      complianceAgent.analyze.mockReturnValue({
        agent_name: 'ComplianceAgent',
        alerts: [complianceAlert],
        risk_score: 1,
        analysis: 'Compliance alert',
      });

      decisionService.process.mockReturnValue([]);
      decisionService.calculateRiskScore.mockReturnValue(0.85);

      const result = service.analyzeBatch([transaction]);

      expect(result.alerts).toHaveLength(2);
      expect(result.alerts).toEqual([fraudAlert, complianceAlert]);
      expect(decisionService.process).toHaveBeenCalledWith([
        fraudAlert,
        complianceAlert,
      ]);
      expect(decisionService.calculateRiskScore).toHaveBeenCalledWith([
        fraudAlert,
        complianceAlert,
      ]);
      expect(result.risk_score).toBe(0.85);
    });

    it('should generate recommendations from aggregated alerts', () => {
      const alert = createAlert(Severity.CRITICAL);

      fraudAgent.analyze.mockReturnValue({
        agent_name: 'FraudAgent',
        alerts: [alert],
        risk_score: 1,
        analysis: 'Critical fraud alert',
      });

      cashflowAgent.analyze.mockReturnValue({
        agent_name: 'CashFlowAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'No alert',
      });

      complianceAgent.analyze.mockReturnValue({
        agent_name: 'ComplianceAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'No alert',
      });

      const recommendation = {
        id: 'rec_test_001',
        type: RecommendationType.BLOCK,
        action: `Block transaction ${transaction.id}`,
        reason: alert.message,
        risk_score: 1,
        status: RecommendationStatus.PENDING,
        created_at: '2026-09-05T00:00:00Z',
      };

      decisionService.process.mockReturnValue([recommendation]);
      decisionService.calculateRiskScore.mockReturnValue(1);

      const result = service.analyzeBatch([transaction]);

      expect(result.recommendations).toEqual([recommendation]);
      expect(result.risk_score).toBe(1);
    });

    it('should process multiple transactions', () => {
      const transaction2: Transaction = {
        ...transaction,
        id: 'txn_test_002',
        amount: 5000,
      };

      fraudAgent.analyze.mockReturnValue({
        agent_name: 'FraudAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'No fraud',
      });

      cashflowAgent.analyze.mockReturnValue({
        agent_name: 'CashFlowAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'No cash flow issue',
      });

      complianceAgent.analyze.mockReturnValue({
        agent_name: 'ComplianceAgent',
        alerts: [],
        risk_score: 0,
        analysis: 'Compliant',
      });

      decisionService.process.mockReturnValue([]);
      decisionService.calculateRiskScore.mockReturnValue(0);

      const result = service.analyzeBatch([
        transaction,
        transaction2,
      ]);

      expect(fraudAgent.analyze).toHaveBeenCalledTimes(2);
      expect(cashflowAgent.analyze).toHaveBeenCalledTimes(2);
      expect(complianceAgent.analyze).toHaveBeenCalledTimes(2);

      expect(result.alerts).toEqual([]);
      expect(result.recommendations).toEqual([]);
      expect(result.risk_score).toBe(0);
    });
  });
});