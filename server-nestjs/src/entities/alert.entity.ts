import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  type: string;

  @Column()
  severity: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column()
  timestamp: string;

  @Column({ default: 'active' })
  status: string;
}
