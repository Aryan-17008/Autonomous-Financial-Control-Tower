import {
  Severity,
  AlertType,
  RecommendationType,
  RecommendationStatus,
  Transaction,
  Alert,
  Recommendation,
  AuditLog,
  AgentResult,
} from './types';

describe('Shared domain types', () => {
  describe('Severity', () => {
    it('should define all severity levels', () => {
      expect(Severity).toEqual({
        CRITICAL: 'CRITICAL',
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW',
      });
    });
  });

  describe('AlertType', () => {
    it('should define all alert types', () => {
      expect(AlertType).toEqual({
        HIGH_AMOUNT: 'HIGH_AMOUNT',
        NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
        LOW_BALANCE: 'LOW_BALANCE',
        LARGE_OUTFLOW: 'LARGE_OUTFLOW',
        LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
        BLOCKED_COUNTERPARTY: 'BLOCKED_COUNTERPARTY',
      });
    });
  });

  describe('RecommendationType', () => {
    it('should define all recommendation types', () => {
      expect(RecommendationType).toEqual({
        BLOCK: 'BLOCK',
        REVIEW: 'REVIEW',
        APPROVE: 'APPROVE',
      });
    });
  });

  describe('RecommendationStatus', () => {
    it('should define all recommendation statuses', () => {
      expect(RecommendationStatus).toEqual({
        PENDING: 'pending',
        EXECUTED: 'executed',
        DISMISSED: 'dismissed',
      });
    });
  });

  describe('Transaction', () => {
    it('should support the expected transaction shape', () => {
      const transaction: Transaction = {
        id: 'txn_123',
        amount: 1500,
        currency: 'USD',
        vendor: 'Test Vendor',
        timestamp: '2026-09-05T10:00:00Z',
        category: 'software',
        counterparty_id: 'cp_123',
      };

      expect(transaction).toMatchObject({
        id: 'txn_123',
        amount: 1500,
        currency: 'USD',
        vendor: 'Test Vendor',
        category: 'software',
        counterparty_id: 'cp_123',
      });
    });
  });

  describe('Alert', () => {
    it('should support the expected alert shape', () => {
      const alert: Alert = {
        type: AlertType.HIGH_AMOUNT,
        severity: Severity.HIGH,
        message: 'Transaction amount exceeds threshold',
        timestamp: '2026-09-05T10:00:00Z',
      };

      expect(alert).toMatchObject({
        type: AlertType.HIGH_AMOUNT,
        severity: Severity.HIGH,
        message: 'Transaction amount exceeds threshold',
      });
    });
  });

  describe('Recommendation', () => {
    it('should support the expected recommendation shape', () => {
      const recommendation: Recommendation = {
        type: RecommendationType.REVIEW,
        action: 'Review transaction',
        reason: 'High risk score',
        risk_score: 0.85,
        status: RecommendationStatus.PENDING,
        created_at: '2026-09-05T10:00:00Z',
      };

      expect(recommendation).toMatchObject({
        type: RecommendationType.REVIEW,
        action: 'Review transaction',
        reason: 'High risk score',
        risk_score: 0.85,
        status: RecommendationStatus.PENDING,
      });
    });
  });

  describe('AuditLog', () => {
    it('should support the expected audit log shape', () => {
      const auditLog: AuditLog = {
        recommendation_id: 'rec_123',
        action: 'REVIEW',
        user: 'system',
        timestamp: '2026-09-05T10:00:00Z',
      };

      expect(auditLog).toMatchObject({
        recommendation_id: 'rec_123',
        action: 'REVIEW',
        user: 'system',
      });
    });
  });

  describe('AgentResult', () => {
    it('should support the expected agent result shape', () => {
      const result: AgentResult = {
        agent_name: 'FraudAgent',
        alerts: [],
        risk_score: 0.25,
        analysis: 'Transaction appears low risk',
      };

      expect(result).toEqual({
        agent_name: 'FraudAgent',
        alerts: [],
        risk_score: 0.25,
        analysis: 'Transaction appears low risk',
      });
    });
  });
});
