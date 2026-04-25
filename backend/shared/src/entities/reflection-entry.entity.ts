import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum ReflectionType {
  GUIDED = "guided",
  FREE = "free",
  STRUCTURED = "structured",
}

export enum ReflectionVisibility {
  PRIVATE = "private",
  TEACHER = "teacher",
  PARENT = "parent",
}

@Entity("reflection_entries")
export class ReflectionEntry extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  @Column({ type: "uuid", nullable: true })
  prompt_id: string;

  @Column({ type: "text", nullable: true })
  prompt_text: string;

  @Column({ type: "text" })
  response: string;

  @Column({ type: "enum", enum: ReflectionType, default: ReflectionType.GUIDED })
  reflection_type: ReflectionType;

  @Column({ type: "enum", enum: ReflectionVisibility, default: ReflectionVisibility.TEACHER })
  visibility: ReflectionVisibility;

  @Column({ type: "text", nullable: true })
  ai_feedback: string;

  @Column({ type: "timestamptz", nullable: true })
  submitted_at: Date;

  @Column({ type: "int", default: 0 })
  word_count: number;
}
