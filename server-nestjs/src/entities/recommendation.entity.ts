import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('recommendations')
export class Recommendation {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column()
  action: string;

  @Column()
  reason: string;

  @Column('real')
  risk_score: number;

  @Column({ default: 'pending' })
  status: string;

  @Column()
  created_at: string;
}
