import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  private categorizeVendor(vendor: string): string {
    const v = vendor.toLowerCase();
    if (v.includes('uber') || v.includes('ola') || v.includes('lyft')) return 'Transport';
    if (v.includes('swiggy') || v.includes('zomato') || v.includes('starbucks')) return 'Food';
    if (v.includes('netflix') || v.includes('spotify') || v.includes('amazon prime')) return 'Subscriptions';
    if (v.includes('aws') || v.includes('google workspace') || v.includes('microsoft')) return 'Software';
    return 'Other';
  }

  async processCSVUpload(csvText: string, userId: string) {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const transactions = [];
    const headers = lines[0].toLowerCase().split(',');
    
    // We expect amount, currency, vendor, timestamp, category, counterparty_id
    // But realistically it can be whatever. Just fallback based on indexes if unknown.
    const amtIdx = headers.indexOf('amount');
    const venIdx = headers.indexOf('vendor');
    const dateIdx = headers.indexOf('date');
    
    let duplicates_skipped = 0;
    let rejected_rows = 0;
    let inserted = 0;

    const validTxs = [];
    const txHashes = new Set(); // To prevent duplicates in the same batch

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      const amountStr = amtIdx >= 0 ? parts[amtIdx] : parts[0];
      const vendorStr = venIdx >= 0 ? parts[venIdx] : parts[1] || 'Unknown';
      const dateStr = dateIdx >= 0 ? parts[dateIdx] : null;
      
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        rejected_rows++;
        continue;
      }
      
      // Simple duplicate hash: vendor + amount + date
      const hash = `${vendorStr}_${amount}_${dateStr || i}`;
      if (txHashes.has(hash)) {
        duplicates_skipped++;
        continue;
      }

      // Check DB for duplicates
      const existing = await this.prisma.transactions.findFirst({
        where: { user_id: userId, vendor: vendorStr, amount: amount }
      });

      if (existing) {
        duplicates_skipped++;
        continue;
      }
      
      txHashes.add(hash);
      
      // If date exists use it, otherwise synthesize past dates (1 to 30 days ago) so forecasting works
      let txDate = new Date();
      if (dateStr && !isNaN(Date.parse(dateStr))) {
         txDate = new Date(dateStr);
      } else {
         txDate.setDate(txDate.getDate() - (i % 30)); 
      }
      
      validTxs.push({
        amount: amount,
        currency: 'INR',
        vendor: vendorStr,
        category: this.categorizeVendor(vendorStr),
        timestamp: txDate
      });
    }

    if (validTxs.length > 0) {
      await this.analyzeTransactions(validTxs, userId);
      inserted = validTxs.length;
    }

    return { inserted, duplicates_skipped, rejected_rows };
  }

  async analyzeTransactions(txs: any[], userId: string) {
    let globalRisk = 0;
    const generatedAlerts = [];
    const generatedRecommendations = [];
    
    // Save transactions first
    const savedTxs = await Promise.all(
      txs.map(async t => {
        // Detect recurring if we have > 2 past transactions for same vendor/amount
        const pastTxs = await this.prisma.transactions.count({
          where: { user_id: userId, vendor: t.vendor, amount: t.amount }
        });
        const isRecurring = pastTxs >= 2;

        return this.prisma.transactions.create({
          data: {
            user_id: userId,
            amount: t.amount,
            currency: t.currency || 'INR',
            vendor: t.vendor || 'Unknown',
            category: t.category || 'Other',
            counterparty_id: t.counterparty_id,
            recurring: isRecurring
          }
        });
      })
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
          explanation: `Flagged because this ₹${tx.amount} payment is highly anomalous compared to your historical averages for vendor ${tx.vendor}.`,
          transaction_id: tx.id
        });
      }

      // Cash Flow Agent
      if (tx.amount > 50000) {
        txRisk += 20;
        generatedAlerts.push({
          type: 'Cash Flow', severity: 'MEDIUM',
          message: 'Large outflow impacting cash runway',
          explanation: `Flagged because this single transaction of ₹${tx.amount} represents a substantial drop in your forecasted 30-day runway.`,
          transaction_id: tx.id
        });
      }

      // Compliance Agent
      if (tx.amount > 50000 || tx.vendor.includes('Blocklist')) {
        txRisk += 30;
        generatedAlerts.push({
          type: 'Compliance', severity: 'HIGH',
          message: 'Transaction exceeds compliance threshold or matches blocklist',
          explanation: `Flagged because vendor ${tx.vendor} matches compliance risk factors or the amount exceeds internal limits.`,
          transaction_id: tx.id
        });
      }

      globalRisk = Math.max(globalRisk, txRisk);
    }

    // Decision Engine mapping alerts to recommendations
    for (const alert of generatedAlerts) {
      const dbAlert = await this.prisma.alerts.create({
        data: {
          type: alert.type, severity: alert.severity, message: alert.message, 
          explanation: alert.explanation, transaction_id: alert.transaction_id, status: 'ACTIVE'
        }
      });

      if (alert.severity === 'CRITICAL') {
        const rec = await this.prisma.recommendations.create({
          data: {
            type: 'BLOCK', action: `Block transaction to ${alert.transaction_id}`,
            reason: alert.message, explanation: alert.explanation, risk_score: 95, status: 'pending'
          }
        });
        generatedRecommendations.push(rec);
      } else if (alert.severity === 'HIGH') {
        const rec = await this.prisma.recommendations.create({
          data: {
            type: 'REVIEW', action: `Review transaction ${alert.transaction_id}`,
            reason: alert.message, explanation: alert.explanation, risk_score: 80, status: 'pending'
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

  async getDashboardSummary(userId: string) {
    const txs = await this.prisma.transactions.findMany({
      where: { user_id: userId }
    });

    let balance = 0;
    let income = 0;
    let expense = 0;
    const categorySpend: Record<string, number> = {};

    for (const t of txs) {
      balance += t.amount;
      if (t.amount > 0) {
        income += t.amount;
      } else {
        expense += Math.abs(t.amount);
        const cat = t.category || 'Other';
        categorySpend[cat] = (categorySpend[cat] || 0) + Math.abs(t.amount);
      }
    }

    const alerts = await this.prisma.alerts.findMany({ where: { status: 'ACTIVE' } });
    
    // Health score: 100 - (active alerts * 10) - (if expenses > income ? 20 : 0)
    let healthScore = 100 - (alerts.length * 10);
    if (expense > income) healthScore -= 20;
    if (healthScore < 0) healthScore = 0;

    return {
      balance,
      income,
      expense,
      healthScore,
      categorySpend
    };
  }

  async getForecast(userId: string) {
    const txs = await this.prisma.transactions.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'asc' }
    });

    let currentBalance = 0;
    let totalDailyBurn = 0;
    let daysWithTx = new Set();
    
    for (const t of txs) {
      currentBalance += t.amount;
      daysWithTx.add(t.timestamp.toISOString().split('T')[0]);
      if (t.amount < 0) {
        totalDailyBurn += Math.abs(t.amount);
      }
    }

    const daysCount = Math.max(1, daysWithTx.size);
    const averageDailyBurn = totalDailyBurn / daysCount;
    
    const runway_days = averageDailyBurn > 0 ? Math.floor(currentBalance / averageDailyBurn) : 999;
    
    const forecast_7d = [];
    let simBalance = currentBalance;
    for(let i=1; i<=7; i++) {
      simBalance -= averageDailyBurn;
      forecast_7d.push(simBalance);
    }
    
    const forecast_30d = [];
    simBalance = currentBalance;
    for(let i=1; i<=30; i++) {
      simBalance -= averageDailyBurn;
      forecast_30d.push(simBalance);
    }

    return {
      runway_days: Math.max(0, runway_days),
      average_daily_burn: averageDailyBurn,
      forecast_7d,
      forecast_30d,
      currentBalance
    };
  }

  async simulateForecast(userId: string, scenario: any) {
    const txs = await this.prisma.transactions.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'asc' }
    });

    let currentBalance = 0;
    let totalDailyBurn = 0;
    let daysWithTx = new Set();
    
    for (const t of txs) {
      currentBalance += t.amount;
      daysWithTx.add(t.timestamp.toISOString().split('T')[0]);
      let amount = t.amount;
      
      // Scenario 1: Reduce spend in a category
      if (scenario.type === 'reduce_category_spend' && t.category === scenario.category && amount < 0) {
         amount = amount * (1 - (scenario.percent / 100));
      }

      if (amount < 0) {
        totalDailyBurn += Math.abs(amount);
      }
    }

    // Scenario 2: One time expense
    if (scenario.type === 'one_time_expense') {
      currentBalance -= scenario.amount;
    }

    const daysCount = Math.max(1, daysWithTx.size);
    let averageDailyBurn = totalDailyBurn / daysCount;

    // Scenario 3: Add new recurring expense
    if (scenario.type === 'new_recurring_expense') {
       averageDailyBurn += (scenario.amount / 30); // Approximate daily cost of a monthly recurring expense
    }

    const runway_days = averageDailyBurn > 0 ? Math.floor(currentBalance / averageDailyBurn) : 999;
    
    const forecast_30d = [];
    let simBalance = currentBalance;
    for(let i=1; i<=30; i++) {
      simBalance -= averageDailyBurn;
      forecast_30d.push(simBalance);
    }

    return {
      runway_days: Math.max(0, runway_days),
      average_daily_burn: averageDailyBurn,
      forecast_30d,
      currentBalance
    };
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
