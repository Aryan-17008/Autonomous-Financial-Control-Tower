import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Column('real')
  amount: number;

  @Column()
  currency: string;

  @Column()
  vendor: string;

  @Column()
  timestamp: string;

  @Column()
  category: string;

  @Column()
  counterparty_id: string;
}
