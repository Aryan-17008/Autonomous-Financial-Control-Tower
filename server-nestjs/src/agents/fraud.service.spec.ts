import { FraudAgent } from './fraud.service';
import { AlertType, Severity, Transaction } from '../types';

describe('FraudAgent', () => {
  let agent: FraudAgent;

  const createTransaction = (amount: number): Transaction => ({
    id: 'txn_test_001',
    amount,
    currency: 'USD',
    vendor: 'Test Vendor',
    timestamp: '2026-09-04T12:00:00Z',
    category: 'transfer',
    counterparty_id: 'VENDOR_001',
  });

  beforeEach(() => {
    agent = new FraudAgent();
  });

  it('should not flag a normal transaction', () => {
    const result = agent.analyze(createTransaction(500));

    expect(result.alerts).toHaveLength(0);
    expect(result.risk_score).toBe(0);
    expect(result.agent_name).toBe('FraudAgent');
  });

  it('should flag transactions above $10,000', () => {
    const result = agent.analyze(createTransaction(15000));

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].type).toBe(AlertType.HIGH_AMOUNT);
    expect(result.alerts[0].severity).toBe(Severity.HIGH);
    expect(result.risk_score).toBe(1);
  });

  it('should flag a negative transaction as critical', () => {
    const result = agent.analyze(createTransaction(-500));

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].type).toBe(AlertType.NEGATIVE_AMOUNT);
    expect(result.alerts[0].severity).toBe(Severity.CRITICAL);
    expect(result.risk_score).toBe(1);
  });

  it('should not flag exactly $10,000', () => {
    const result = agent.analyze(createTransaction(10000));

    expect(result.alerts).toHaveLength(0);
    expect(result.risk_score).toBe(0);
  });

  it('should flag $10,001', () => {
    const result = agent.analyze(createTransaction(10001));

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].type).toBe(AlertType.HIGH_AMOUNT);
    expect(result.alerts[0].severity).toBe(Severity.HIGH);
  });
});