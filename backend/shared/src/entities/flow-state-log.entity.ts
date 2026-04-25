import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum FlowTriggerSource {
  HOMEWORK = "homework",
  EXAM = "exam",
  RETRIEVAL_TASK = "retrieval_task",
  CLASSROOM_ACTIVITY = "classroom_activity",
  CO_CURRICULAR = "co_curricular",
  DIGITAL_TASK = "digital_task"
}

export enum FlowStateIntensity {
  MICRO = "micro",   // brief flow episode < 15 min
  MODERATE = "moderate", // 15-45 min sustained engagement
  DEEP = "deep"      // 45+ min, challenge-skill balance optimal
}

@Entity("flow_state_log")
@Index(["school_id", "student_id", "academic_year_id"])
@Index(["school_id", "student_id", "trigger_source"])
export class FlowStateLog extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "varchar" })
  trigger_source: string; // FlowTriggerSource enum value

  // Source entity that triggered this flow detection
  @Column({ type: "uuid", nullable: true })
  source_entity_id: string;

  @Column({ type: "varchar", nullable: true })
  source_entity_type: string;

  // Csikszentmihalyi challenge-skill balance — both 0-100
  // Flow zone: challenge 40-70, skill 40-70, delta < 20
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  challenge_level: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  skill_level: number;

  // Engagement signal — time-on-task ratio vs expected duration
  // 1.0 = exactly on time, > 1.0 = exceeded expected (positive signal)
  @Column({ type: "decimal", precision: 5, scale: 3, nullable: true })
  time_on_task_ratio: number;

  // Performance quality signal — 0-100
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  performance_signal: number;

  @Column({ type: "varchar", default: FlowStateIntensity.MICRO })
  intensity: string;

  // Time of day — school-local time (IANA tz applied at render)
  @Column({ type: "time", nullable: true })
  detected_at_time: string; // HH:MM

  // Subject linkage — flow often subject-specific
  @Column({ type: "uuid", nullable: true })
  subject_id: string;

  // Confidence of flow detection — 0.00 to 1.00
  @Column({ type: "decimal", precision: 4, scale: 3, default: 0.7 })
  confidence: number;

  // Whether included in EQProfile flow_state_index computation
  @Column({ type: "boolean", default: false })
  aggregated: boolean;

  @Column({ type: "timestamptz", nullable: true })
  aggregated_at: Date;
}
