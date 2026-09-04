import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Transaction entity - mirrors the shared Transaction interface in src/types.ts.
 * IDs are business strings (e.g. "txn_123"), not autoincrement.
 */
@Entity('transactions')
export class Transaction {
  @PrimaryColumn('text')
  id: string;

  @Column('real')
  amount: number;

  @Column('text')
  currency: string;

  @Column('text')
  vendor: string;

  @Column('text')
  timestamp: string;

  @Column('text')
  category: string;

  @Column('text')
  counterparty_id: string;
}
