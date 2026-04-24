import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from "./base.entity";

export enum TaxFramework {
  GST_IN = "GST_IN",       // India GST
  VAT_UK = "VAT_UK",       // UK VAT
  VAT_EU = "VAT_EU",       // EU VAT
  GST_AU = "GST_AU",       // Australia GST
  GST_SG = "GST_SG",       // Singapore GST
  TAX_US = "TAX_US",       // US Sales Tax
  NONE = "NONE",           // Tax-exempt jurisdictions
}

export enum TaxInvoiceStatus {
  DRAFT = "draft",
  ISSUED = "issued",
  CANCELLED = "cancelled",
  AMENDED = "amended",
}

@Entity("tax_invoice")
@Index(["school_id", "invoice_number"], { unique: true })
@Index(["school_id", "fee_invoice_id"])
@Index(["school_id", "tax_framework"])
export class TaxInvoice extends XceliQosBaseEntity {
  // Links to existing FeeInvoice
  @Column({ type: "uuid" })
  fee_invoice_id: string;

  @Column({ type: "uuid" })
  student_id: string;

  // School-configured invoice series e.g. INV-2024-
  @Column({ type: "varchar", length: 50 })
  invoice_number: string;

  @Column({ type: "enum", enum: TaxFramework, default: TaxFramework.NONE })
  tax_framework: TaxFramework;

  // School tax registration (GSTIN/VAT reg/ABN/GST reg)
  @Column({ type: "varchar", nullable: true })
  school_tax_number: string;

  // Recipient tax number if applicable
  @Column({ type: "varchar", nullable: true })
  recipient_tax_number: string;

  @Column({ type: "date" })
  invoice_date: string;

  // Line items jsonb: [{ description, quantity, unit_price, tax_code, tax_rate, tax_amount, hsn_sac_code, amount }]
  // hsn_sac_code populated only for GST_IN
  @Column({ type: "jsonb", default: [] })
  line_items: Record<string, any>[];

  @Column({ type: "decimal", precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  total_tax: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  total_amount: number;

  // ISO 4217
  @Column({ type: "varchar", length: 3, default: "INR" })
  currency: string;

  @Column({ type: "enum", enum: TaxInvoiceStatus, default: TaxInvoiceStatus.DRAFT })
  status: TaxInvoiceStatus;

  // Amendment linkage
  @Column({ type: "uuid", nullable: true })
  amends_invoice_id: string;

  // Framework-specific data jsonb
  // GST_IN: { supply_type, place_of_supply, reverse_charge }
  // VAT_UK: { vat_scheme, vat_period }
  // TAX_US: { state_code, county_code }
  @Column({ type: "jsonb", default: {} })
  framework_data: Record<string, any>;

  @Column({ type: "uuid", nullable: true })
  finance_entry_id: string;
}
