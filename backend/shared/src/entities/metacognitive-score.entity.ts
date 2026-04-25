import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum MetacognitiveDimension {
  PLANNING = "planning",
  MONITORING = "monitoring",
  EVALUATION = "evaluation",
  SELF_REGULATION = "self_regulation",
  GOAL_SETTING = "goal_setting",
}

@Entity("metacognitive_scores")
export class MetacognitiveScore extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  @Column({ type: "enum", enum: MetacognitiveDimension })
  dimension: MetacognitiveDimension;

  @Column({ type: "int" })
  score: number;

  @Column({ type: "uuid", nullable: true })
  evidence_ref: string;

  @Column({ type: "timestamptz", nullable: true })
  assessed_at: Date;

  @Column({ type: "uuid", nullable: true })
  assessed_by: string;
}
