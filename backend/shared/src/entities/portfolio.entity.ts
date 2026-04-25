import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum PortfolioVisibility {
  PRIVATE = "private",       // student + teacher only
  CLASS = "class",           // visible to class teacher(s)
  SCHOOL = "school",         // visible to all school staff
  PARENT = "parent",         // visible to linked parent/guardian
  PUBLIC = "public"          // shareable link (consent required)
}

export enum PortfolioStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  EXPORTED = "exported"
}

@Entity("portfolio")
@Index(["school_id", "student_id", "academic_year_id"], { unique: true })
export class Portfolio extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "varchar", nullable: true })
  title: string; // student-set title — nullable, defaults to academic year label

  @Column({ type: "text", nullable: true })
  student_bio: string; // student-authored intro (self-curation eligible age only)

  // Visibility — teacher sets ceiling, student can restrict further
  @Column({ type: "varchar", default: PortfolioVisibility.PRIVATE })
  visibility: string;

  // Teacher-set max visibility ceiling — student cannot exceed this
  @Column({ type: "varchar", default: PortfolioVisibility.PARENT })
  visibility_ceiling: string;

  @Column({ type: "varchar", default: PortfolioStatus.ACTIVE })
  status: string;

  // Self-curation enabled for this student (age/grade check done at API layer via PortfolioConfig)
  @Column({ type: "boolean", default: false })
  self_curation_enabled: boolean;

  // Item counts — denormalised for dashboard performance
  @Column({ type: "int", default: 0 })
  total_items: number;

  @Column({ type: "int", default: 0 })
  teacher_curated_count: number;

  @Column({ type: "int", default: 0 })
  student_curated_count: number;

  // Teacher who owns/manages this portfolio
  @Column({ type: "uuid", nullable: true })
  primary_teacher_id: string;

  // Student data sovereignty — export tracking
  @Column({ type: "timestamptz", nullable: true })
  last_exported_at: Date;

  @Column({ type: "varchar", nullable: true })
  last_export_format: string; // pdf | json | html

  // Public share token — null unless visibility=public and consent obtained
  @Column({ type: "varchar", nullable: true })
  share_token: string;

  @Column({ type: "boolean", default: false })
  share_consent_obtained: boolean;

  @Column({ type: "uuid", nullable: true })
  share_consent_given_by: string;

  @Column({ type: "timestamptz", nullable: true })
  share_consent_given_at: Date;

  // Growth Mindset summary narrative — teacher-authored or AI-assisted + approved
  @Column({ type: "text", nullable: true })
  growth_narrative: string;

  @Column({ type: "boolean", default: false })
  growth_narrative_approved: boolean;
}
