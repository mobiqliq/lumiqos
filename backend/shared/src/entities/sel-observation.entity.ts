import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

// CASEL 5 core competencies — globally recognised framework
export enum CASELCompetency {
  SELF_AWARENESS = "self_awareness",
  SELF_MANAGEMENT = "self_management",
  SOCIAL_AWARENESS = "social_awareness",
  RELATIONSHIP_SKILLS = "relationship_skills",
  RESPONSIBLE_DECISION_MAKING = "responsible_decision_making"
}

export enum SELObservationSource {
  TEACHER_OBSERVATION = "teacher_observation",
  AI_INFERENCE = "ai_inference",
  SELF_REPORT = "self_report",         // student self-assessment (Class 6+ / age 11+)
  PEER_REPORT = "peer_report",         // anonymised peer feedback
  PARENT_REPORT = "parent_report",
  ASSESSMENT_DERIVED = "assessment_derived" // derived from exam/homework behavioural signals
}

export enum SELObservationContext {
  CLASSROOM = "classroom",
  GROUP_WORK = "group_work",
  INDEPENDENT_WORK = "independent_work",
  CO_CURRICULAR = "co_curricular",
  BREAK_TIME = "break_time",
  ONLINE = "online",
  HOME = "home",
  COMMUNITY = "community"
}

export enum SELSignalValence {
  STRENGTH = "strength",   // competency demonstrated
  GROWTH = "growth",       // competency emerging / developing
  CONCERN = "concern"      // competency gap — triggers care review NOT discipline
}

@Entity("sel_observation")
@Index(["school_id", "student_id", "academic_year_id"])
@Index(["school_id", "student_id", "casel_competency"])
@Index(["school_id", "academic_year_id", "valence"])
export class SELObservation extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // CASEL 5 primary competency this observation addresses
  @Column({ type: "varchar" })
  casel_competency: string; // CASELCompetency enum value

  // Optional secondary competency (many SEL behaviours span two)
  @Column({ type: "varchar", nullable: true })
  secondary_competency: string;

  // Local framework sub-competency label (RULER / MindUP / Zones / custom)
  // Mapped to CASEL via SELFrameworkConfig
  @Column({ type: "varchar", nullable: true })
  local_framework_indicator: string;

  // Signal strength — 0.00 to 100.00
  @Column({ type: "decimal", precision: 5, scale: 2 })
  signal_strength: number;

  // Confidence in this observation — 0.00 to 1.00
  @Column({ type: "decimal", precision: 4, scale: 3, default: 1.0 })
  confidence: number;

  @Column({ type: "varchar" })
  source: string; // SELObservationSource enum value

  @Column({ type: "varchar", nullable: true })
  context: string; // SELObservationContext enum value

  @Column({ type: "varchar" })
  valence: string; // SELSignalValence enum value

  // Observer — null if AI_INFERENCE
  @Column({ type: "uuid", nullable: true })
  observed_by: string;

  // Source entity linkage — polymorphic
  @Column({ type: "varchar", nullable: true })
  source_entity_type: string; // homework_assignment | exam | retrieval_task | wellbeing_flag

  @Column({ type: "uuid", nullable: true })
  source_entity_id: string;

  // Growth Mindset evidence note — mandatory for teacher/parent sources
  // Never deficit-first: "showed persistence when..." not "failed to..."
  @Column({ type: "text", nullable: true })
  evidence_note: string;

  // Whether this observation has been aggregated into EQProfile
  @Column({ type: "boolean", default: false })
  aggregated: boolean;

  @Column({ type: "timestamptz", nullable: true })
  aggregated_at: Date;

  // Safeguarding: concern-valence observations routed to care team flag
  // This FK records if a WellbeingFlag was raised from this observation
  @Column({ type: "uuid", nullable: true })
  wellbeing_flag_id: string;
}
