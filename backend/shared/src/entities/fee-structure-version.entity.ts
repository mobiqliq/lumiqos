import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("fee_structure_version")
@Index(["school_id", "academic_year_id", "class_id", "fee_category_id", "effective_from"])
export class FeeStructureVersion extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "uuid" })
  class_id: string;

  @Column({ type: "uuid" })
  fee_category_id: string;

  // Version number — auto-incremented per school+year+class+category
  @Column({ type: "int", default: 1 })
  version: number;

  // ISO 4217
  @Column({ type: "varchar", length: 3, default: "INR" })
  currency: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  // ANNUAL | MONTHLY | QUARTERLY | TERM | ONE_TIME
  @Column({ type: "varchar", length: 20, default: "ANNUAL" })
  frequency: string;

  // Due day of month/term for installment generation
  @Column({ type: "int", nullable: true })
  due_day: number;

  // Number of installments if frequency != ONE_TIME
  @Column({ type: "int", default: 1 })
  installments: number;

  // Discount rules jsonb: [{ type: sibling|merit|staff_ward|scholarship, percentage, max_amount }]
  @Column({ type: "jsonb", default: [] })
  discount_rules: Record<string, any>[];

  // Late fee rules jsonb: { grace_days, daily_rate, max_late_fee }
  @Column({ type: "jsonb", default: {} })
  late_fee_config: Record<string, any>;

  @Column({ type: "date" })
  effective_from: string;

  @Column({ type: "date", nullable: true })
  effective_to: string;

  // Supersedes previous version
  @Column({ type: "uuid", nullable: true })
  supersedes_id: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "text", nullable: true })
  change_reason: string;
}
