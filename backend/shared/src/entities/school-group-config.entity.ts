import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("school_group_config")
@Index(["school_id"], { unique: true })
export class SchoolGroupConfig extends XceliQosBaseEntity {
  // Whether student moderators are permitted at this school
  @Column({ type: "boolean", default: true })
  allow_student_moderators: boolean;

  // Max sub-group nesting depth — enforced at service layer (recommended: 2)
  @Column({ type: "int", default: 2 })
  max_subgroup_depth: number;

  // Who can create sub-groups: lead | moderator
  @Column({ type: "varchar", length: 50, default: "lead" })
  subgroup_creation_role: string;

  // Whether broadcasts from group channel require lead teacher approval
  @Column({ type: "boolean", default: false })
  broadcast_requires_lead_approval: boolean;

  // Whether house points system is enabled
  @Column({ type: "boolean", default: true })
  house_points_enabled: boolean;

  // Whether co-curricular participation feeds Portfolio (31.21)
  @Column({ type: "boolean", default: true })
  feed_portfolio: boolean;

  // Whether co-curricular participation feeds LearningDNA (31.19)
  @Column({ type: "boolean", default: true })
  feed_learning_dna: boolean;

  // Whether alumni can retain group affiliation (31.22)
  @Column({ type: "boolean", default: true })
  alumni_affiliation_enabled: boolean;

  // Enabled group types at this school — school can restrict
  @Column({ type: "jsonb", default: ["house", "sports_team", "co_curricular", "committee", "project"] })
  enabled_group_types: string[];
}
