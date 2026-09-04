import { CashFlowAgent } from './cashflow.service';
import { AlertType, Severity, Transaction } from '../types';

describe('CashFlowAgent', () => {
  let agent: CashFlowAgent;

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
    agent = new CashFlowAgent();
  });

  it('should not flag a normal transaction', () => {
    const result = agent.analyze(createTransaction(500));

    expect(result.alerts).toHaveLength(0);
    expect(result.agent_name).toBe('CashFlowAgent');
    expect(result.risk_score).toBe(0);
  });

  it('should flag when balance drops below $20,000', () => {
    const result = agent.analyze(createTransaction(81001));

    expect(result.alerts).toHaveLength(2);

    const lowBalanceAlert = result.alerts.find(
      (alert) => alert.type === AlertType.LOW_BALANCE,
    );

    expect(lowBalanceAlert).toBeDefined();
    expect(lowBalanceAlert?.severity).toBe(Severity.HIGH);
  });

  it('should not flag balance exactly at $20,000', () => {
    const result = agent.analyze(createTransaction(80000));

    expect(
      result.alerts.some(
        (alert) => alert.type === AlertType.LOW_BALANCE,
      ),
    ).toBe(false);
  });

  it('should flag an outflow above $50,000', () => {
    const result = agent.analyze(createTransaction(50001));

    const outflowAlert = result.alerts.find(
      (alert) => alert.type === AlertType.LARGE_OUTFLOW,
    );

    expect(outflowAlert).toBeDefined();
    expect(outflowAlert?.severity).toBe(Severity.MEDIUM);
  });

  it('should not flag an outflow exactly at $50,000', () => {
    const result = agent.analyze(createTransaction(50000));

    expect(
      result.alerts.some(
        (alert) => alert.type === AlertType.LARGE_OUTFLOW,
      ),
    ).toBe(false);
  });
});