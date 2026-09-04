import { ComplianceAgent } from './compliance.service';
import { AlertType, Severity, Transaction } from '../types';

describe('ComplianceAgent', () => {
  let agent: ComplianceAgent;

  const createTransaction = (
    amount: number,
    counterparty_id = 'VENDOR_001',
  ): Transaction => ({
    id: 'txn_test_001',
    amount,
    currency: 'USD',
    vendor: 'Test Vendor',
    timestamp: '2026-09-04T12:00:00Z',
    category: 'transfer',
    counterparty_id,
  });

  beforeEach(() => {
    agent = new ComplianceAgent();
  });

  it('should approve a compliant transaction', () => {
    const result = agent.analyze(createTransaction(1000));

    expect(result.agent_name).toBe('ComplianceAgent');
    expect(result.alerts).toHaveLength(0);
    expect(result.risk_score).toBe(0);
  });

  it('should flag a transaction above the $50,000 limit', () => {
    const result = agent.analyze(createTransaction(50001));

    expect(result.alerts).toHaveLength(1);

    const alert = result.alerts.find(
      (alert) => alert.type === AlertType.LIMIT_EXCEEDED,
    );

    expect(alert).toBeDefined();
    expect(alert?.severity).toBe(Severity.HIGH);
    expect(alert?.transaction_id).toBe('txn_test_001');
    expect(alert?.message).toContain('$50000');
    expect(result.risk_score).toBe(1.0);
  });

  it('should not flag a transaction exactly at the $50,000 limit', () => {
    const result = agent.analyze(createTransaction(50000));

    expect(result.alerts).toHaveLength(0);
    expect(result.risk_score).toBe(0);
  });

  it('should flag a blocked counterparty', () => {
    const result = agent.analyze(
      createTransaction(1000, 'VENDOR_BLOCKED_1'),
    );

    expect(result.alerts).toHaveLength(1);

    const alert = result.alerts.find(
      (alert) => alert.type === AlertType.BLOCKED_COUNTERPARTY,
    );

    expect(alert).toBeDefined();
    expect(alert?.severity).toBe(Severity.CRITICAL);
    expect(alert?.transaction_id).toBe('txn_test_001');
    expect(alert?.message).toContain('VENDOR_BLOCKED_1');
    expect(result.risk_score).toBe(1.0);
  });

  it('should flag the second blocked counterparty', () => {
    const result = agent.analyze(
      createTransaction(1000, 'VENDOR_BLOCKED_2'),
    );

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].type).toBe(AlertType.BLOCKED_COUNTERPARTY);
    expect(result.alerts[0].severity).toBe(Severity.CRITICAL);
    expect(result.risk_score).toBe(1.0);
  });

  it('should flag both limit and blocked counterparty violations', () => {
    const result = agent.analyze(
      createTransaction(50001, 'VENDOR_BLOCKED_1'),
    );

    expect(result.alerts).toHaveLength(2);
    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: AlertType.LIMIT_EXCEEDED,
          severity: Severity.HIGH,
        }),
        expect.objectContaining({
          type: AlertType.BLOCKED_COUNTERPARTY,
          severity: Severity.CRITICAL,
        }),
      ]),
    );
    expect(result.risk_score).toBe(1.0);
  });

  it('should include the transaction id in the analysis', () => {
    const result = agent.analyze(createTransaction(1000));

    expect(result.analysis).toBe(
      'Compliance check complete for txn_test_001',
    );
  });
});