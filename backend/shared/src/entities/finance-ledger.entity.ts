import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum FiscalYearStartMonth {
  JANUARY = 1,
  APRIL = 4,
  JULY = 7,
  SEPTEMBER = 9,
  OCTOBER = 10,
}

@Entity('finance_ledger')
@Index(['school_id', 'academic_year_id'], { unique: true })
export class FinanceLedger extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  // ISO 4217 currency code e.g. INR, USD, GBP, AED, SGD
  @Column({ type: 'varchar', length: 3, default: 'INR' })
  base_currency: string;

  // Fiscal year start month — configurable per school/jurisdiction
  @Column({ type: 'int', default: FiscalYearStartMonth.APRIL })
  fiscal_year_start_month: number;

  // Chart of accounts — jsonb array of { code, name, type: asset|liability|income|expense|equity }
  @Column({ type: 'jsonb', default: [] })
  chart_of_accounts: Record<string, any>[];

  // Multi-currency enabled
  @Column({ type: 'boolean', default: false })
  multi_currency_enabled: boolean;

  // Supported currencies (ISO 4217 codes)
  @Column({ type: 'jsonb', default: [] })
  supported_currencies: string[];

  // Export format configured for this school
  // TALLY_XML | XERO_CSV | ZOHO_CSV | QUICKBOOKS_IIF | SAGE_CSV | GENERIC_CSV
  @Column({ type: 'varchar', length: 30, default: 'GENERIC_CSV' })
  export_format: string;

  // Tax framework: GST_IN | VAT_UK | VAT_EU | GST_AU | GST_SG | TAX_US | NONE
  @Column({ type: 'varchar', length: 20, default: 'NONE' })
  tax_framework: string;

  // School tax registration number (GSTIN / VAT reg / ABN / GST reg)
  @Column({ type: 'varchar', nullable: true })
  tax_registration_number: string;

  // Opening balance for this ledger period
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  opening_balance: number;

  @Column({ type: 'boolean', default: false })
  is_closed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;
}
