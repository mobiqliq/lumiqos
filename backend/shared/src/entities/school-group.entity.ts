import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum SchoolGroupType {
  HOUSE = "house",
  SPORTS_TEAM = "sports_team",
  CO_CURRICULAR = "co_curricular",
  COMMITTEE = "committee",
  PROJECT = "project",
}

@Entity("school_group")
@Index(["school_id", "group_type"])
@Index(["school_id", "academic_year_id"])
export class SchoolGroup extends XceliQosBaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: SchoolGroupType })
  group_type: SchoolGroupType;

  // Self-referential FK for sub-groups (max depth 2 enforced at service layer)
  @Column({ type: "uuid", nullable: true })
  parent_group_id: string;

  // Lead teacher — required for all groups
  @Column({ type: "uuid" })
  lead_teacher_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // Visual identity
  @Column({ type: "varchar", length: 50, nullable: true })
  color: string;

  // File ref only — no binary storage
  @Column({ type: "varchar", length: 500, nullable: true })
  emblem_ref: string;

  // Points tally — for house competitions
  @Column({ type: "int", default: 0 })
  points: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;
}
