import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("parent_mindset_progress")
export class ParentMindsetProgress extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid", nullable: true })
  parent_id: string;

  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  @Column({ type: "text", nullable: true })
  summary: string;

  @Column({ type: "int", default: 0 })
  moments_count: number;

  @Column({ type: "timestamptz", nullable: true })
  last_updated: Date;

  @Column({ type: "text", nullable: true })
  ai_narrative: string;
}
