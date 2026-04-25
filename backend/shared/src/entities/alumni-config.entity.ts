import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum ConsentModel {
  OPT_IN = "opt_in",
  OPT_OUT = "opt_out",
}

export enum AlumniConsentJurisdiction {
  GDPR = "GDPR",
  DPDP = "DPDP",
  FERPA = "FERPA",
  PDPA = "PDPA",
  PIPEDA = "PIPEDA",
  OTHER = "OTHER",
}

@Entity("alumni_config")
@Index(["school_id"], { unique: true })
export class AlumniConfig extends XceliQosBaseEntity {
  // Minimum age for independent alumni opt-in
  @Column({ type: "int", default: 18 })
  min_alumni_age: number;

  // Invite code validity window in days
  @Column({ type: "int", default: 90 })
  invite_code_expiry_days: number;

  // Quarterly age-check cron toggle (0 0 1 */3 *)
  @Column({ type: "boolean", default: true })
  quarterly_job_enabled: boolean;

  @Column({ type: "enum", enum: ConsentModel, default: ConsentModel.OPT_IN })
  consent_model: ConsentModel;

  @Column({ type: "enum", enum: AlumniConsentJurisdiction, default: AlumniConsentJurisdiction.GDPR })
  consent_jurisdiction: AlumniConsentJurisdiction;

  @Column({ type: "boolean", default: true })
  alumni_network_enabled: boolean;

  // School-level teacher comms toggle — individual teacher opt-in also required
  @Column({ type: "boolean", default: false })
  teacher_comms_enabled: boolean;

  // E2E encryption — deferred to Sprint 22+, placeholder
  @Column({ type: "boolean", default: false })
  e2e_encryption_enabled: boolean;

  // Jurisdiction-driven retention period in days (0 = indefinite)
  @Column({ type: "int", default: 0 })
  data_retention_days: number;

  @Column({ type: "boolean", default: true })
  career_pathway_enabled: boolean;

  // Reinstatement only via front desk (issues new invite code manually)
  @Column({ type: "boolean", default: true })
  reinstatement_requires_front_desk: boolean;
}
