import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  recommendation_id?: string;

  @Column()
  action: string;

  @Column({ default: 'system' })
  user: string;

  @Column()
  timestamp: string;
}
