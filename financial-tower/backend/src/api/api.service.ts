import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  async analyzeTransactions(txs: any[], userId: string) {
    let globalRisk = 0;
    const generatedAlerts = [];
    const generatedRecommendations = [];
    
    // Save transactions first
    const savedTxs = await Promise.all(
      txs.map(t => this.prisma.transactions.create({
        data: {
          user_id: userId,
          amount: t.amount,
          currency: t.currency || 'INR',
          vendor: t.vendor || 'Unknown',
          category: t.category || 'Other',
          counterparty_id: t.counterparty_id
        }
      }))
    );

    // Run Agents
    for (const tx of savedTxs) {
      let txRisk = 0;
      
      // Fraud Agent
      if (tx.amount > 10000 || tx.amount < 0) {
        txRisk += 50;
        generatedAlerts.push({
          type: 'Fraud', severity: tx.amount > 50000 ? 'CRITICAL' : 'HIGH',
          message: `Unusual transaction amount detected: ${tx.amount}`,
          transaction_id: tx.id
        });
      }

      // Cash Flow Agent (simulated balance check)
      if (tx.amount > 50000) {
        txRisk += 20;
        generatedAlerts.push({
          type: 'Cash Flow', severity: 'MEDIUM',
          message: 'Large outflow impacting cash runway',
          transaction_id: tx.id
        });
      }

      // Compliance Agent
      if (tx.amount > 50000 || tx.vendor.includes('Blocklist')) {
        txRisk += 30;
        generatedAlerts.push({
          type: 'Compliance', severity: 'HIGH',
          message: 'Transaction exceeds compliance threshold or matches blocklist',
          transaction_id: tx.id
        });
      }

      globalRisk = Math.max(globalRisk, txRisk);
    }

    // Decision Engine mapping alerts to recommendations
    for (const alert of generatedAlerts) {
      const dbAlert = await this.prisma.alerts.create({
        data: {
          type: alert.type, severity: alert.severity, message: alert.message, transaction_id: alert.transaction_id, status: 'ACTIVE'
        }
      });

      if (alert.severity === 'CRITICAL') {
        const rec = await this.prisma.recommendations.create({
          data: {
            type: 'BLOCK', action: `Block transaction to ${alert.transaction_id}`,
            reason: alert.message, risk_score: 95, status: 'pending'
          }
        });
        generatedRecommendations.push(rec);
      } else if (alert.severity === 'HIGH') {
        const rec = await this.prisma.recommendations.create({
          data: {
            type: 'REVIEW', action: `Review transaction ${alert.transaction_id}`,
            reason: alert.message, risk_score: 80, status: 'pending'
          }
        });
        generatedRecommendations.push(rec);
      }
    }

    return {
      risk_score: Math.min(100, globalRisk),
      alerts_count: generatedAlerts.length,
      recommendations: generatedRecommendations
    };
  }

  async getAlerts() {
    return this.prisma.alerts.findMany({ where: { status: 'ACTIVE' }, orderBy: { timestamp: 'desc' }});
  }

  async getRecommendations() {
    return this.prisma.recommendations.findMany({ where: { status: 'pending' }, orderBy: { risk_score: 'desc' }});
  }

  async getAudit() {
    return this.prisma.audit_log.findMany({ orderBy: { timestamp: 'desc' }});
  }

  async getTransactions() {
    return this.prisma.transactions.findMany({ orderBy: { timestamp: 'desc' }});
  }

  async executeRecommendation(id: string, userId: string) {
    const rec = await this.prisma.recommendations.update({
      where: { id },
      data: { status: 'executed' }
    });

    await this.prisma.audit_log.create({
      data: {
        recommendation_id: id,
        action: `Executed action: ${rec.action}`,
        user: userId
      }
    });

    // Also try to resolve any alerts with matching reasons or types if we had a mapping
    // Simple hack for demo: resolve active alerts related to this block
    const alerts = await this.prisma.alerts.findMany({ where: { status: 'ACTIVE' } });
    for (const a of alerts) {
      if (rec.reason.includes(a.message)) {
        await this.prisma.alerts.update({ where: { id: a.id }, data: { status: 'RESOLVED' } });
      }
    }

    return { success: true, rec };
  }
}
