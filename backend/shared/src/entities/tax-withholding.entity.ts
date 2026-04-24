import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum WithholdingFramework {
  TDS_IN = "TDS_IN",         // India TDS
  PAYE_UK = "PAYE_UK",       // UK PAYE
  WITHHOLDING_US = "WITHHOLDING_US", // US federal withholding
  PAYG_AU = "PAYG_AU",       // Australia PAYG
  CPF_SG = "CPF_SG",         // Singapore CPF
  NONE = "NONE",
}

export enum WithholdingStatus {
  COMPUTED = "computed",
  DEDUCTED = "deducted",
  REMITTED = "remitted",
  DISPUTED = "disputed",
}

@Entity("tax_withholding")
@Index(["school_id", "staff_id", "period_start"])
@Index(["school_id", "withholding_framework"])
export class TaxWithholding extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  staff_id: string;

  @Column({ type: "enum", enum: WithholdingFramework, default: WithholdingFramework.NONE })
  withholding_framework: WithholdingFramework;

  // Staff tax identification (PAN/NI number/SSN/TFN/NRIC)
  @Column({ type: "varchar", nullable: true })
  staff_tax_id: string;

  // Period
  @Column({ type: "date" })
  period_start: string;

  @Column({ type: "date" })
  period_end: string;

  // Gross payment this period
  @Column({ type: "decimal", precision: 15, scale: 2 })
  gross_amount: number;

  // Applicable threshold for withholding obligation
  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  applicable_threshold: number;

  // Withholding rate as decimal (e.g. 0.10 = 10%)
  @Column({ type: "decimal", precision: 5, scale: 4 })
  withholding_rate: number;

  // Computed withholding amount
  @Column({ type: "decimal", precision: 15, scale: 2 })
  withholding_amount: number;

  // ISO 4217
  @Column({ type: "varchar", length: 3, default: "INR" })
  currency: string;

  @Column({ type: "enum", enum: WithholdingStatus, default: WithholdingStatus.COMPUTED })
  status: WithholdingStatus;

  // Remittance reference when paid to tax authority
  @Column({ type: "varchar", nullable: true })
  remittance_reference: string;

  @Column({ type: "timestamp", nullable: true })
  remitted_at: Date;

  // Framework-specific data jsonb
  // TDS_IN: { section_code, nature_of_payment, tan }
  // PAYE_UK: { tax_code, national_insurance_category }
  // WITHHOLDING_US: { form_type, state_code }
  @Column({ type: "jsonb", default: {} })
  framework_data: Record<string, any>;

  @Column({ type: "uuid", nullable: true })
  finance_entry_id: string;
}
