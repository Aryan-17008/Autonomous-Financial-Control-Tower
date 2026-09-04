import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrchestratorService } from '../services/orchestrator.service';
import { Transaction } from '../entities/transaction.entity';
import { Alert } from '../entities/alert.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { AuditLog } from '../entities/audit.entity';
import { Transaction as TransactionType } from '../types';

@Controller('api')
export class TransactionsController {
  constructor(
    private readonly orchestrator: OrchestratorService,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Alert) private readonly alertRepo: Repository<Alert>,
    @InjectRepository(Recommendation) private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  @Post('analyze')
  async analyze(@Body() body: { transactions: TransactionType[] }) {
    const result = this.orchestrator.analyzeBatch(body.transactions);

    // Persist transactions
    for (const tx of body.transactions) {
      await this.txRepo.save(tx as any);
    }

    // Persist alerts
    for (const alert of result.alerts) {
      await this.alertRepo.save(alert as any);
    }

    // Persist recommendations
    for (const rec of result.recommendations) {
      await this.recRepo.save(rec as any);
    }

    return {
      risk_score: result.risk_score,
      alerts_count: result.alerts.length,
      recommendations: result.recommendations,
    };
  }

  @Get('alerts')
  async getAlerts() {
    const alerts = await this.alertRepo.find({ where: { status: 'active' }, order: { timestamp: 'DESC' } });
    return { alerts };
  }

  @Get('recommendations')
  async getRecommendations() {
    const recommendations = await this.recRepo.find({ where: { status: 'pending' } });
    return { recommendations };
  }

  @Post('execute/:id')
  async execute(@Param('id') id: string) {
    const rec = await this.recRepo.findOne({ where: { id } });
    if (!rec) return { error: 'Recommendation not found' };

    rec.status = 'executed';
    await this.recRepo.save(rec);

    await this.auditRepo.save({
      recommendation_id: id,
      action: rec.action,
      timestamp: new Date().toISOString(),
    } as any);

    return { status: 'executed', recommendation: rec };
  }

  @Get('audit')
  async getAudit() {
    const auditTrail = await this.auditRepo.find({ order: { timestamp: 'DESC' } });
    return { audit_trail: auditTrail };
  }

  @Get('transactions')
  async getTransactions() {
    const transactions = await this.txRepo.find({ order: { timestamp: 'DESC' } });
    return { transactions };
  }
}
