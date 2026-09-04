import { TransactionsController } from './transactions.controller';
import { OrchestratorService } from '../services/orchestrator.service';
import { Transaction as TransactionType } from '../types';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const orchestrator = {
    analyzeBatch: jest.fn(),
  };

  const txRepo = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const alertRepo = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const recRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const auditRepo = {
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new TransactionsController(
      orchestrator as any,
      txRepo as any,
      alertRepo as any,
      recRepo as any,
      auditRepo as any,
    );
  });

  describe('analyze', () => {
    it('should analyze transactions and persist transactions, alerts, and recommendations', async () => {
      const transactions: TransactionType[] = [
        {
            id: 'tx-1',
            amount: 5000,
            currency: 'USD',
            vendor: 'Test Vendor',
            timestamp: '2026-09-05T10:00:00.000Z',
            category: 'operations',
            counterparty_id: 'cp-1',
        },
      ];

      const alerts = [
        {
          id: 'alert-1',
          severity: 'high',
        },
      ];

      const recommendations = [
        {
          id: 'rec-1',
          action: 'review_transaction',
        },
      ];

      orchestrator.analyzeBatch.mockReturnValue({
        risk_score: 85,
        alerts,
        recommendations,
      });

      const result = await controller.analyze({ transactions });

      expect(orchestrator.analyzeBatch).toHaveBeenCalledTimes(1);
      expect(orchestrator.analyzeBatch).toHaveBeenCalledWith(transactions);

      expect(txRepo.save).toHaveBeenCalledTimes(1);
      expect(txRepo.save).toHaveBeenCalledWith(transactions[0]);

      expect(alertRepo.save).toHaveBeenCalledTimes(1);
      expect(alertRepo.save).toHaveBeenCalledWith(alerts[0]);

      expect(recRepo.save).toHaveBeenCalledTimes(1);
      expect(recRepo.save).toHaveBeenCalledWith(recommendations[0]);

      expect(result).toEqual({
        risk_score: 85,
        alerts_count: 1,
        recommendations,
      });
    });

    it('should persist every transaction, alert, and recommendation', async () => {
      const transactions: TransactionType[] = [
        {
            id: 'tx-1',
            amount: 100,
            currency: 'USD',
            vendor: 'Vendor 1',
            timestamp: '2026-09-05T10:00:00.000Z',
            category: 'operations',
            counterparty_id: 'cp-1',
        },
        {
            id: 'tx-2',
            amount: 200,
            currency: 'USD',
            vendor: 'Vendor 2',
            timestamp: '2026-09-05T11:00:00.000Z',
            category: 'operations',
            counterparty_id: 'cp-2',
        },
        {
            id: 'tx-3',
            amount: 300,
            currency: 'USD',
            vendor: 'Vendor 3',
            timestamp: '2026-09-05T12:00:00.000Z',
            category: 'operations',
            counterparty_id: 'cp-3',
        },
      ];

      const alerts = [
        { id: 'alert-1' },
        { id: 'alert-2' },
      ];

      const recommendations = [
        { id: 'rec-1' },
        { id: 'rec-2' },
      ];

      orchestrator.analyzeBatch.mockReturnValue({
        risk_score: 50,
        alerts,
        recommendations,
      });

      await controller.analyze({ transactions });

      expect(txRepo.save).toHaveBeenCalledTimes(3);
      expect(alertRepo.save).toHaveBeenCalledTimes(2);
      expect(recRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should return zero alert count when there are no alerts', async () => {
      const transactions: TransactionType[] = [
        {
            id: 'tx-1',
            amount: 100,
            currency: 'USD',
            vendor: 'Test Vendor',
            timestamp: '2026-09-05T10:00:00.000Z',
            category: 'operations',
            counterparty_id: 'cp-1',
        },
       ];

      orchestrator.analyzeBatch.mockReturnValue({
        risk_score: 10,
        alerts: [],
        recommendations: [],
      });

      const result = await controller.analyze({ transactions });

      expect(result).toEqual({
        risk_score: 10,
        alerts_count: 0,
        recommendations: [],
      });
    });
  });

  describe('getAlerts', () => {
    it('should return active alerts ordered by timestamp descending', async () => {
      const alerts = [
        { id: 'alert-2', status: 'active' },
        { id: 'alert-1', status: 'active' },
      ];

      alertRepo.find.mockResolvedValue(alerts);

      const result = await controller.getAlerts();

      expect(alertRepo.find).toHaveBeenCalledTimes(1);
      expect(alertRepo.find).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: { timestamp: 'DESC' },
      });

      expect(result).toEqual({ alerts });
    });
  });

  describe('getRecommendations', () => {
    it('should return pending recommendations', async () => {
      const recommendations = [
        { id: 'rec-1', status: 'pending' },
        { id: 'rec-2', status: 'pending' },
      ];

      recRepo.find.mockResolvedValue(recommendations);

      const result = await controller.getRecommendations();

      expect(recRepo.find).toHaveBeenCalledTimes(1);
      expect(recRepo.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
      });

      expect(result).toEqual({ recommendations });
    });
  });

  describe('execute', () => {
    it('should return an error when the recommendation does not exist', async () => {
      recRepo.findOne.mockResolvedValue(null);

      const result = await controller.execute('rec-404');

      expect(recRepo.findOne).toHaveBeenCalledTimes(1);
      expect(recRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'rec-404' },
      });

      expect(recRepo.save).not.toHaveBeenCalled();
      expect(auditRepo.save).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: 'Recommendation not found',
      });
    });

    it('should execute a recommendation and create an audit record', async () => {
      const recommendation = {
        id: 'rec-1',
        action: 'review_transaction',
        status: 'pending',
      };

      recRepo.findOne.mockResolvedValue(recommendation);

      const result = await controller.execute('rec-1');

      expect(recRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
      });

      expect(recommendation.status).toBe('executed');

      expect(recRepo.save).toHaveBeenCalledTimes(1);
      expect(recRepo.save).toHaveBeenCalledWith(recommendation);

      expect(auditRepo.save).toHaveBeenCalledTimes(1);

      const auditRecord = auditRepo.save.mock.calls[0][0];

      expect(auditRecord).toMatchObject({
        recommendation_id: 'rec-1',
        action: 'review_transaction',
      });

      expect(auditRecord.timestamp).toEqual(expect.any(String));

      expect(result).toEqual({
        status: 'executed',
        recommendation,
      });
    });
  });

  describe('getAudit', () => {
    it('should return the audit trail ordered by timestamp descending', async () => {
      const auditTrail = [
        { id: 'audit-2' },
        { id: 'audit-1' },
      ];

      auditRepo.find.mockResolvedValue(auditTrail);

      const result = await controller.getAudit();

      expect(auditRepo.find).toHaveBeenCalledTimes(1);
      expect(auditRepo.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
      });

      expect(result).toEqual({
        audit_trail: auditTrail,
      });
    });
  });

  describe('getTransactions', () => {
    it('should return transactions ordered by timestamp descending', async () => {
      const transactions = [
        { id: 'tx-2' },
        { id: 'tx-1' },
      ];

      txRepo.find.mockResolvedValue(transactions);

      const result = await controller.getTransactions();

      expect(txRepo.find).toHaveBeenCalledTimes(1);
      expect(txRepo.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
      });

      expect(result).toEqual({
        transactions,
      });
    });
  });
});