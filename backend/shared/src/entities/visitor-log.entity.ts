import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum VisitorIdType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  DRIVING_LICENCE = "driving_licence",
  OTHER = "other"
}

export enum VisitorPurpose {
  PARENT_VISIT = "parent_visit",
  VENDOR = "vendor",
  GOVERNMENT = "government",
  INTERVIEW = "interview",
  EVENT = "event",
  OTHER = "other"
}

@Entity("visitor_log")
@Index(["school_id", "check_in_at"])
export class VisitorLog extends XceliQosBaseEntity {
  @Column({ type: "varchar" })
  visitor_name: string;

  @Column({ type: "varchar", default: VisitorIdType.OTHER })
  id_type: string;

  @Column({ type: "varchar", nullable: true })
  id_number_encrypted: string; // encrypted at app layer — never expose raw

  @Column({ type: "varchar", default: VisitorPurpose.OTHER })
  purpose: string;

  @Column({ type: "varchar", nullable: true })
  purpose_notes: string;

  // Host staff
  @Column({ type: "uuid", nullable: true })
  host_staff_id: string;

  // Pre-registration
  @Column({ type: "boolean", default: false })
  pre_registered: boolean;

  @Column({ type: "uuid", nullable: true })
  approved_by: string; // staff user id who pre-approved

  @Column({ type: "timestamptz", nullable: true })
  pre_registered_at: Date;

  // Check-in / check-out
  @Column({ type: "timestamptz", nullable: false })
  check_in_at: Date;

  @Column({ type: "timestamptz", nullable: true })
  check_out_at: Date;

  // Badge / pass number
  @Column({ type: "varchar", nullable: true })
  badge_number: string;

  // Jurisdiction-driven data consent
  @Column({ type: "boolean", default: false })
  data_consent_obtained: boolean;

  @Column({ type: "varchar", nullable: true })
  consent_jurisdiction: string; // GDPR | DPDP | FERPA | PIPEDA | OTHER

  // Student being visited (nullable — not all visitors have a student link)
  @Column({ type: "uuid", nullable: true })
  student_id: string;

  // Photo capture reference (stored externally — this is just a ref key)
  @Column({ type: "varchar", nullable: true })
  photo_ref: string;

  @Column({ type: "boolean", default: false })
  flagged: boolean;

  @Column({ type: "text", nullable: true })
  flag_reason: string;
}
