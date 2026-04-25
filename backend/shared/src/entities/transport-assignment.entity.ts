import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum ConsentJurisdiction {
  GDPR = "gdpr",
  DPDP = "dpdp",
  FERPA = "ferpa",
  PIPEDA = "pipeda",
  OTHER = "other"
}

@Entity("transport_assignment")
@Index(["school_id", "student_id", "academic_year_id"], { unique: true })
export class TransportAssignment extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  route_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // Pickup coordinates
  @Column({ type: "decimal", precision: 9, scale: 6, nullable: true })
  pickup_lat: number;

  @Column({ type: "decimal", precision: 9, scale: 6, nullable: true })
  pickup_lng: number;

  @Column({ type: "varchar", nullable: true })
  pickup_stop_label: string;

  // Dropoff coordinates
  @Column({ type: "decimal", precision: 9, scale: 6, nullable: true })
  dropoff_lat: number;

  @Column({ type: "decimal", precision: 9, scale: 6, nullable: true })
  dropoff_lng: number;

  @Column({ type: "varchar", nullable: true })
  dropoff_stop_label: string;

  // Opt-in consent
  @Column({ type: "boolean", default: false })
  opt_in: boolean;

  @Column({ type: "varchar", nullable: true })
  consent_jurisdiction: string; // ConsentJurisdiction enum value

  @Column({ type: "timestamptz", nullable: true })
  consent_given_at: Date;

  @Column({ type: "uuid", nullable: true })
  consent_given_by: string; // parent/guardian user id

  // Location alert opt-in (parent notified on pickup/dropoff)
  @Column({ type: "boolean", default: false })
  parent_notified: boolean;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  // Fee linkage
  @Column({ type: "boolean", default: false })
  fee_waived: boolean;

  @Column({ type: "text", nullable: true })
  fee_waiver_reason: string;
}
