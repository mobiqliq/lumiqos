import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum MindsetMomentType {
  PRAISE = "praise",
  CHALLENGE = "challenge",
  SETBACK = "setback",
  BREAKTHROUGH = "breakthrough",
}

@Entity("mindset_moments")
export class MindsetMoment extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid", nullable: true })
  teacher_id: string;

  @Column({ type: "enum", enum: MindsetMomentType })
  moment_type: MindsetMomentType;

  @Column({ type: "text", nullable: true })
  context: string;

  @Column({ type: "text", nullable: true })
  growth_language: string;

  @Column({ type: "uuid", nullable: true })
  linked_subject_id: string;

  @Column({ type: "uuid", nullable: true })
  linked_assessment_id: string;

  @Column({ type: "boolean", default: false })
  shared_with_parent: boolean;

  @Column({ type: "timestamptz", nullable: true })
  shared_at: Date;
}
