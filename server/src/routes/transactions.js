const express = require('express');
const db = require('../db/database');
const FraudAgent = require('../agents/fraud');
const CashFlowAgent = require('../agents/cashflow');
const ComplianceAgent = require('../agents/compliance');
const DecisionEngine = require('../engine/decision');

const router = express.Router();
const fraudAgent = new FraudAgent();
const cashflowAgent = new CashFlowAgent();
const complianceAgent = new ComplianceAgent();
const decisionEngine = new DecisionEngine();

const severityScores = { CRITICAL: 1.0, HIGH: 0.7, MEDIUM: 0.4, LOW: 0.1 };

// Store transactions and return analysis
router.post('/analyze', (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array required' });
  }

  const allAlerts = [];
  const insertTx = db.prepare('INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?,?)');

  for (const tx of transactions) {
    insertTx.run(tx.id, tx.amount, tx.currency, tx.vendor, tx.timestamp, tx.category, tx.counterparty_id);

    const fraudResult = fraudAgent.analyze(tx);
    const cashflowResult = cashflowAgent.analyze(tx);
    const complianceResult = complianceAgent.analyze(tx);

    allAlerts.push(
      ...fraudResult.alerts,
      ...cashflowResult.alerts,
      ...complianceResult.alerts
    );
  }

  // Save alerts to DB
  const insertAlert = db.prepare('INSERT INTO alerts (type, severity, message, transaction_id, timestamp) VALUES (?,?,?,?,?)');
  for (const alert of allAlerts) {
    insertAlert.run(alert.type, alert.severity, alert.message, alert.transaction_id, new Date().toISOString());
  }

  // Generate recommendations
  const recommendations = decisionEngine.process(allAlerts);
  const insertRec = db.prepare('INSERT OR IGNORE INTO recommendations (id, type, action, reason, risk_score, status, created_at) VALUES (?,?,?,?,?,?,?)');
  for (const rec of recommendations) {
    insertRec.run(rec.id, rec.type, rec.action, rec.reason, rec.risk_score, rec.status, rec.created_at);
  }

  const riskScore = decisionEngine.calculateRiskScore(allAlerts);

  res.json({
    risk_score: riskScore,
    alerts_count: allAlerts.length,
    recommendations
  });
});

// Get all active alerts
router.get('/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts WHERE status = ? ORDER BY timestamp DESC').all('active');
  res.json({ alerts });
});

// Get pending recommendations
router.get('/recommendations', (req, res) => {
  const recs = db.prepare('SELECT * FROM recommendations WHERE status = ?').all('pending');
  res.json({ recommendations: recs });
});

// Execute a recommendation
router.post('/execute/:id', (req, res) => {
  const { id } = req.params;
  const rec = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  db.prepare('UPDATE recommendations SET status = ? WHERE id = ?').run('executed', id);
  db.prepare('INSERT INTO audit_log (recommendation_id, action) VALUES (?, ?)').run(id, rec.action);

  res.json({ status: 'executed', recommendation: rec });
});

// Get audit trail
router.get('/audit', (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_log ORDER BY timestamp DESC').all();
  res.json({ audit_trail: logs });
});

// Get all transactions
router.get('/transactions', (req, res) => {
  const txs = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC').all();
  res.json({ transactions: txs });
});

module.exports = router;
