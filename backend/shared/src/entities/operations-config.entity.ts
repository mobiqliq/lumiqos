import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("operations_config")
@Index(["school_id"], { unique: true })
export class OperationsConfig extends XceliQosBaseEntity {
  // Library
  @Column({ type: "varchar", default: "dewey" })
  library_classification_system: string; // dewey | loc | custom

  @Column({ type: "int", default: 14 })
  max_loan_days: number;

  @Column({ type: "int", default: 2 })
  max_renewals: number;

  @Column({ type: "boolean", default: true })
  library_fines_enabled: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  fine_per_day: number;

  @Column({ type: "varchar", default: "USD" })
  fine_currency: string; // ISO 4217

  // Transport
  @Column({ type: "varchar", default: "km" })
  transport_distance_unit: string; // km | miles

  @Column({ type: "boolean", default: false })
  transport_fee_enabled: boolean;

  @Column({ type: "boolean", default: false })
  transport_location_alerts_enabled: boolean;

  // Visitor
  @Column({ type: "boolean", default: true })
  visitor_id_required: boolean;

  @Column({ type: "jsonb", default: ["national_id", "passport", "driving_licence", "other"] })
  accepted_visitor_id_types: string[];

  @Column({ type: "boolean", default: false })
  visitor_photo_required: boolean;

  @Column({ type: "boolean", default: true })
  visitor_pre_registration_enabled: boolean;

  // Data retention — jurisdiction-driven (days)
  @Column({ type: "int", default: 1095 }) // 3 years default
  data_retention_days: number;

  @Column({ type: "varchar", nullable: true })
  compliance_jurisdiction: string; // GDPR | DPDP | FERPA | PIPEDA | OTHER
}
