import { Injectable } from '@nestjs/common';
import { FraudAgent } from '../agents/fraud.service';
import { CashFlowAgent } from '../agents/cashflow.service';
import { ComplianceAgent } from '../agents/compliance.service';
import { DecisionService } from '../engine/decision.service';
import { Transaction, Alert, Recommendation, AgentResult } from '../types';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly fraudAgent: FraudAgent,
    private readonly cashflowAgent: CashFlowAgent,
    private readonly complianceAgent: ComplianceAgent,
    private readonly decisionService: DecisionService,
  ) {}

  analyze(transaction: Transaction): AgentResult[] {
    const results: AgentResult[] = [
      this.fraudAgent.analyze(transaction),
      this.cashflowAgent.analyze(transaction),
      this.complianceAgent.analyze(transaction),
    ];
    return results;
  }

  analyzeBatch(transactions: Transaction[]): {
    alerts: Alert[];
    recommendations: Recommendation[];
    risk_score: number;
  } {
    const allAlerts: Alert[] = [];

    for (const tx of transactions) {
      const results = this.analyze(tx);
      for (const result of results) {
        allAlerts.push(...result.alerts);
      }
    }

    const recommendations = this.decisionService.process(allAlerts);
    const riskScore = this.decisionService.calculateRiskScore(allAlerts);

    return {
      alerts: allAlerts,
      recommendations,
      risk_score: riskScore,
    };
  }
}

export default OrchestratorService;
