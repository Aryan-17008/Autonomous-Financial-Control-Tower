import { DecisionService } from './decision.service';
import {
  Alert,
  AlertType,
  RecommendationStatus,
  RecommendationType,
  Severity,
} from '../types';

describe('DecisionService', () => {
  let service: DecisionService;

  const createAlert = (severity: Severity): Alert => ({
    type: AlertType.HIGH_AMOUNT,
    severity,
    message: `Test ${severity} alert`,
    transaction_id: 'txn_test_001',
    timestamp: '2026-09-04T12:00:00Z',
  });

  beforeEach(() => {
    service = new DecisionService();
  });

  describe('process', () => {
    it('should return no recommendations for empty alerts', () => {
      const result = service.process([]);

      expect(result).toHaveLength(0);
    });

    it('should create BLOCK recommendation for CRITICAL alert', () => {
      const result = service.process([
        createAlert(Severity.CRITICAL),
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(RecommendationType.BLOCK);
      expect(result[0].action).toContain('txn_test_001');
      expect(result[0].risk_score).toBe(1.0);
      expect(result[0].status).toBe(RecommendationStatus.PENDING);
    });

    it('should create REVIEW recommendation for HIGH alert', () => {
      const result = service.process([
        createAlert(Severity.HIGH),
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(RecommendationType.REVIEW);
      expect(result[0].action).toContain('txn_test_001');
      expect(result[0].risk_score).toBe(0.7);
      expect(result[0].status).toBe(RecommendationStatus.PENDING);
    });

    it('should not create recommendation for MEDIUM alert', () => {
      const result = service.process([
        createAlert(Severity.MEDIUM),
      ]);

      expect(result).toHaveLength(0);
    });

    it('should not create recommendation for LOW alert', () => {
      const result = service.process([
        createAlert(Severity.LOW),
      ]);

      expect(result).toHaveLength(0);
    });

    it('should process multiple alerts', () => {
      const result = service.process([
        createAlert(Severity.CRITICAL),
        createAlert(Severity.HIGH),
        createAlert(Severity.MEDIUM),
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(RecommendationType.BLOCK);
      expect(result[1].type).toBe(RecommendationType.REVIEW);
    });
  });

  describe('calculateRiskScore', () => {
    it('should return 0 for no alerts', () => {
      expect(service.calculateRiskScore([])).toBe(0);
    });

    it('should calculate risk score for a single CRITICAL alert', () => {
      expect(
        service.calculateRiskScore([createAlert(Severity.CRITICAL)]),
      ).toBe(1);
    });

    it('should calculate risk score for a single HIGH alert', () => {
      expect(
        service.calculateRiskScore([createAlert(Severity.HIGH)]),
      ).toBe(0.7);
    });

    it('should calculate average risk score for multiple alerts', () => {
      const result = service.calculateRiskScore([
        createAlert(Severity.CRITICAL),
        createAlert(Severity.LOW),
      ]);

      expect(result).toBeCloseTo(0.55);
    });

    it('should cap risk score at 1', () => {
      const result = service.calculateRiskScore([
        createAlert(Severity.CRITICAL),
        createAlert(Severity.CRITICAL),
        createAlert(Severity.CRITICAL),
      ]);

      expect(result).toBe(1);
    });
  });

  describe('processSmart', () => {
    it('should behave like process when AI enhancer is not enabled', async () => {
      const alerts = [createAlert(Severity.HIGH)];

      const result = await service.processSmart(alerts);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(RecommendationType.REVIEW);
      expect(result[0].risk_score).toBe(0.7);
    });
  });
});