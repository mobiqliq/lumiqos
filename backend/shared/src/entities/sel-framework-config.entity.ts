import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

// Supported SEL frameworks — extensible via custom
export enum SELFramework {
  CASEL = "casel",           // US — Collaborative for Academic, Social, and Emotional Learning
  RULER = "ruler",           // Yale Center for Emotional Intelligence
  MINDUP = "mindup",         // Mindfulness-based — Canada/global
  ZONES_OF_REGULATION = "zones_of_regulation", // Leah Kuypers — widely used UK/AU/US
  PATHS = "paths",           // Promoting Alternative Thinking Strategies — EU/US
  SECOND_STEP = "second_step", // Committee for Children — global
  CUSTOM = "custom"          // School-defined framework
}

@Entity("sel_framework_config")
@Index(["school_id"], { unique: true })
export class SELFrameworkConfig extends XceliQosBaseEntity {
  // Primary framework in use at this school
  @Column({ type: "varchar", default: SELFramework.CASEL })
  primary_framework: string;

  // Secondary framework (optional — some schools blend two)
  @Column({ type: "varchar", nullable: true })
  secondary_framework: string;

  // Mapping: local indicator → CASEL 5 competency
  // jsonb array: [{ local_indicator, local_label, casel_competency, framework }]
  // Allows any framework's sub-competencies to map to CASEL 5
  @Column({ type: "jsonb", default: [] })
  indicator_mappings: Record<string, any>[];

  // CASEL 5 competency labels — school can localise/rename
  // e.g. { self_awareness: "Knowing Myself" } for younger cohorts
  @Column({ type: "jsonb", default: {} })
  competency_labels: Record<string, string>;

  // Age/grade band for self-report eligibility
  // jsonb: { min_age: 11, min_grade: 6 }
  @Column({ type: "jsonb", default: { min_age: 11, min_grade: 6 } })
  self_report_eligibility: Record<string, number>;

  // Whether peer report is enabled (requires parental consent in most jurisdictions)
  @Column({ type: "boolean", default: false })
  peer_report_enabled: boolean;

  // Consent requirement for peer report — jurisdiction-driven
  @Column({ type: "varchar", nullable: true })
  peer_report_consent_jurisdiction: string; // GDPR | DPDP | FERPA | PIPEDA | OTHER

  // Minimum observations before EQProfile advances from DRAFT to PROVISIONAL
  @Column({ type: "int", default: 3 })
  provisional_threshold: number;

  // Minimum observations before EQProfile advances to ESTABLISHED
  @Column({ type: "int", default: 6 })
  established_threshold: number;

  // Whether concern-valence observations auto-raise a WellbeingFlag
  @Column({ type: "boolean", default: true })
  auto_flag_concern_observations: boolean;

  // Severity threshold for auto-flag (signal_strength >= this value)
  @Column({ type: "decimal", precision: 5, scale: 2, default: 60.0 })
  auto_flag_threshold: number;

  // Whether EQProfile feeds XceliQScore dimensions
  @Column({ type: "boolean", default: true })
  feed_xceliq_score: boolean;

  // Research basis
  @Column({ type: "text", nullable: true })
  framework_notes: string;
}
