// Shared domain types for the Financial Control Tower
// Both You and Nikhil should import from here to avoid conflicts

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum AlertType {
  HIGH_AMOUNT = 'HIGH_AMOUNT',
  NEGATIVE_AMOUNT = 'NEGATIVE_AMOUNT',
  LOW_BALANCE = 'LOW_BALANCE',
  LARGE_OUTFLOW = 'LARGE_OUTFLOW',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  BLOCKED_COUNTERPARTY = 'BLOCKED_COUNTERPARTY'
}

export enum RecommendationType {
  BLOCK = 'BLOCK',
  REVIEW = 'REVIEW',
  APPROVE = 'APPROVE'
}

export enum RecommendationStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  DISMISSED = 'dismissed'
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  vendor: string;
  timestamp: string;
  category: string;
  counterparty_id: string;
}

export interface Alert {
  id?: number;
  type: AlertType;
  severity: Severity;
  message: string;
  transaction_id?: string;
  timestamp: string;
  status?: string;
}

export interface Recommendation {
  id?: string;
  type: RecommendationType;
  action: string;
  reason: string;
  risk_score: number;
  status: RecommendationStatus;
  created_at: string;
}

export interface AuditLog {
  id?: number;
  recommendation_id?: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface AgentResult {
  agent_name: string;
  alerts: Alert[];
  risk_score: number;
  analysis: string;
}
