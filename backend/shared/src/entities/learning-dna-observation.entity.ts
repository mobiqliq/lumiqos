import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum ObservationSource {
  TEACHER_OBSERVATION = "teacher_observation",
  ASSESSMENT_RESULT = "assessment_result",
  HOMEWORK_PATTERN = "homework_pattern",
  EXAM_RESULT = "exam_result",
  AI_INFERENCE = "ai_inference",
  SELF_REPORT = "self_report",        // student self-assessment (Class 6+)
  PARENT_REPORT = "parent_report"
}

export enum ObservationContext {
  CLASSROOM = "classroom",
  EXAM = "exam",
  HOMEWORK = "homework",
  CO_CURRICULAR = "co_curricular",
  GROUP_WORK = "group_work",
  INDEPENDENT_WORK = "independent_work",
  DIGITAL = "digital",
  PHYSICAL = "physical"
}

@Entity("learning_dna_observation")
@Index(["school_id", "student_id", "academic_year_id"])
@Index(["school_id", "student_id", "intelligence_dimension"])
export class LearningDNAObservation extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // Which Gardner intelligence this observation is evidence for
  @Column({ type: "varchar" })
  intelligence_dimension: string; // GardnerIntelligence enum value

  // Observed strength signal — 0.00 to 100.00
  @Column({ type: "decimal", precision: 5, scale: 2 })
  signal_strength: number;

  // Confidence in this observation — 0.00 to 1.00
  @Column({ type: "decimal", precision: 4, scale: 3, default: 1.0 })
  confidence: number;

  @Column({ type: "varchar" })
  source: string; // ObservationSource enum value

  @Column({ type: "varchar", nullable: true })
  context: string; // ObservationContext enum value

  // Observer — null if AI_INFERENCE or SELF_REPORT
  @Column({ type: "uuid", nullable: true })
  observed_by: string;

  // Source entity linkage — polymorphic reference
  // e.g. exam_id, homework_assignment_id, xceliq_score_id
  @Column({ type: "varchar", nullable: true })
  source_entity_type: string;

  @Column({ type: "uuid", nullable: true })
  source_entity_id: string;

  // Cognitive load signal from this observation (Sweller)
  // intrinsic: complexity of material | extraneous: presentation quality
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  intrinsic_load: number; // 0-100

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  extraneous_load: number; // 0-100

  // Time of day when observation occurred — for chronobio inference
  @Column({ type: "time", nullable: true })
  observed_at_time: string; // HH:MM — school tz

  // Free-form evidence note — Growth Mindset language enforced at API layer
  @Column({ type: "text", nullable: true })
  evidence_note: string;

  // Whether this observation has been incorporated into LearningDNAProfile
  @Column({ type: "boolean", default: false })
  aggregated: boolean;

  @Column({ type: "timestamptz", nullable: true })
  aggregated_at: Date;
}
