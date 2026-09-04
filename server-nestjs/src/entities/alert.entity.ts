import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AlertType, Severity } from '../types';

/**
 * Alert entity - persists alerts produced by the agents.
 * type/severity store the shared enum value strings from src/types.ts.
 */
@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  type: AlertType;

  @Column('text')
  severity: Severity;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  transaction_id?: string;

  @Column('text')
  timestamp: string;

  @Column('text', { default: 'active' })
  status: string;
}
