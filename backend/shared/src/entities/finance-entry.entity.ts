import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum FinanceEntryType {
  FEE_INVOICE = 'fee_invoice',
  FEE_PAYMENT = 'fee_payment',
  SALARY_PAYMENT = 'salary_payment',
  EXPENSE = 'expense',
  ADJUSTMENT = 'adjustment',
  REVERSAL = 'reversal',
  OPENING_BALANCE = 'opening_balance',
  TAX_PAYMENT = 'tax_payment',
  WITHHOLDING = 'withholding',
}

@Entity('finance_entry')
@Index(['school_id', 'ledger_id'])
@Index(['school_id', 'entry_date'])
@Index(['school_id', 'reference_type', 'reference_id'])
export class FinanceEntry extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  ledger_id: string;

  // Double-entry: debit_account_code + credit_account_code from chart_of_accounts
  @Column({ type: 'varchar', length: 50 })
  debit_account_code: string;

  @Column({ type: 'varchar', length: 50 })
  credit_account_code: string;

  @Column({ type: 'enum', enum: FinanceEntryType })
  entry_type: FinanceEntryType;

  // Amount in transaction currency
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  // ISO 4217 transaction currency
  @Column({ type: 'varchar', length: 3 })
  currency: string;

  // Exchange rate to base currency (1.0 if same currency)
  @Column({ type: 'decimal', precision: 15, scale: 6, default: 1 })
  exchange_rate: number;

  // Amount converted to ledger base currency
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  base_currency_amount: number;

  @Column({ type: 'date' })
  entry_date: string;

  // Polymorphic reference — fee_invoice | fee_payment | salary | expense
  @Column({ type: 'varchar', length: 50, nullable: true })
  reference_type: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  @Column({ type: 'text', nullable: true })
  narration: string;

  // Reversal linkage
  @Column({ type: 'uuid', nullable: true })
  reverses_entry_id: string;

  @Column({ type: 'boolean', default: false })
  is_reversed: boolean;

  // Tax amount component (if applicable)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount: number;

  // Tax breakdown jsonb: [{ tax_code, rate, amount, tax_name }]
  @Column({ type: 'jsonb', default: [] })
  tax_breakdown: Record<string, any>[];
}
