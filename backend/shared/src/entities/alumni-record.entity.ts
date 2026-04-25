import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum AlumniStatus {
  PENDING_OPT_IN = "pending_opt_in",
  DORMANT = "dormant",
  ACTIVE = "active",
  OPTED_OUT = "opted_out",
  SUSPENDED = "suspended",
}

export enum AlumniExitReason {
  GRADUATED = "graduated",
  TRANSFERRED = "transferred",
  WITHDRAWN = "withdrawn",
  OTHER = "other",
}

@Entity("alumni_record")
@Index(["school_id", "status"])
@Index(["school_id", "student_id"], { unique: true })
export class AlumniRecord extends XceliQosBaseEntity {
  // FK to student — all profile data fetched from school DB on demand
  @Column({ type: "uuid" })
  student_id: string;

  // Federated identity for future cross-school alumni network
  @Column({ type: "varchar", length: 255, nullable: true })
  federated_id: string;

  @Column({ type: "enum", enum: AlumniStatus, default: AlumniStatus.PENDING_OPT_IN })
  status: AlumniStatus;

  // invite_code stored as bcrypt hash — raw code never persisted
  @Column({ type: "varchar", length: 255, nullable: true })
  invite_code_hash: string;

  @Column({ type: "timestamp", nullable: true })
  invite_code_expires_at: Date;

  @Column({ type: "timestamp", nullable: true })
  invite_code_used_at: Date;

  // Tracks reinstatement history
  @Column({ type: "int", default: 0 })
  invite_issued_count: number;

  // Underage consent path
  @Column({ type: "boolean", default: false })
  parent_consented: boolean;

  @Column({ type: "timestamp", nullable: true })
  parent_consent_at: Date;

  @Column({ type: "uuid", nullable: true })
  parent_consent_by: string;

  // Activation timestamps
  @Column({ type: "timestamp", nullable: true })
  opted_in_at: Date;

  @Column({ type: "timestamp", nullable: true })
  opted_out_at: Date;

  @Column({ type: "text", nullable: true })
  opted_out_reason: string;

  // Academic context
  @Column({ type: "int", nullable: true })
  graduation_year: number;

  @Column({ type: "enum", enum: AlumniExitReason, nullable: true })
  exit_reason: AlumniExitReason;

  // House/group affiliation from 31.22a — nullable, retained post-graduation
  @Column({ type: "uuid", nullable: true })
  house_group_id: string;

  // Signal Protocol E2E — deferred to Sprint 22+, placeholder only
  @Column({ type: "jsonb", nullable: true })
  e2e_public_key_bundle: Record<string, any>;

  @Column({ type: "boolean", default: false })
  e2e_keys_registered: boolean;

  // Career pathway — self-reported post-activation, separately consented
  @Column({ type: "boolean", default: false })
  career_pathway_consented: boolean;

  @Column({ type: "jsonb", nullable: true })
  career_pathway: Record<string, any>;

  // Teacher comms opt-in — teacher must also opt in at their end
  @Column({ type: "boolean", default: false })
  teacher_comms_enabled: boolean;

  @Column({ type: "timestamp", nullable: true })
  last_active_at: Date;

  @Column({ type: "text", nullable: true })
  suspension_reason: string;
}
