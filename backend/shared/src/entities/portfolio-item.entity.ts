import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum PortfolioItemType {
  EXAM_RESULT = "exam_result",
  HOMEWORK = "homework",
  PROJECT = "project",
  CO_CURRICULAR = "co_curricular",
  REFLECTION = "reflection",           // written reflection — Growth Mindset
  SKILL_MASTERY = "skill_mastery",     // links to StudentSkillMastery
  SEL_OBSERVATION = "sel_observation", // links to SELObservation
  LEARNING_DNA = "learning_dna",       // links to LearningDNAProfile snapshot
  AWARD = "award",
  COMMUNITY_SERVICE = "community_service",
  CREATIVE_WORK = "creative_work",
  EXTERNAL = "external"                // externally submitted artifact
}

export enum PortfolioItemCurator {
  TEACHER = "teacher",
  STUDENT = "student",
  PARENT = "parent",
  SYSTEM = "system"   // auto-added by AI/system (e.g. XceliQScore milestone)
}

export enum PortfolioItemStatus {
  DRAFT = "draft",         // student-curated, not yet submitted for approval
  PENDING_APPROVAL = "pending_approval", // submitted, awaiting teacher approval
  APPROVED = "approved",   // teacher-approved, visible per portfolio visibility
  REJECTED = "rejected",   // returned with feedback
  ARCHIVED = "archived"
}

@Entity("portfolio_item")
@Index(["school_id", "portfolio_id"])
@Index(["school_id", "student_id", "item_type"])
@Index(["school_id", "portfolio_id", "is_featured"])
export class PortfolioItem extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  portfolio_id: string;

  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "varchar" })
  item_type: string; // PortfolioItemType enum value

  @Column({ type: "varchar" })
  curator: string; // PortfolioItemCurator enum value

  @Column({ type: "uuid", nullable: true })
  curated_by: string; // user id of curator

  // Title and description — Growth Mindset language enforced at API layer
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  // Student reflection — mandatory for student-curated items
  @Column({ type: "text", nullable: true })
  student_reflection: string;

  // Teacher annotation — optional, Growth Mindset language
  @Column({ type: "text", nullable: true })
  teacher_annotation: string;

  // Polymorphic evidence linkage
  @Column({ type: "varchar", nullable: true })
  source_entity_type: string; // exam | homework_assignment | sel_observation | skill_mastery | learning_dna_profile

  @Column({ type: "uuid", nullable: true })
  source_entity_id: string;

  // File reference — external storage key, not raw file data
  // File upload infrastructure is deferred — this stores the key only
  @Column({ type: "varchar", nullable: true })
  file_ref: string;

  @Column({ type: "varchar", nullable: true })
  file_mime_type: string;

  @Column({ type: "varchar", nullable: true })
  file_original_name: string;

  // Subject linkage
  @Column({ type: "uuid", nullable: true })
  subject_id: string;

  // Skill/competency tags — jsonb array of skill_ids or CASEL competency strings
  @Column({ type: "jsonb", default: [] })
  competency_tags: string[];

  // Featured item — shown prominently in portfolio view
  @Column({ type: "boolean", default: false })
  is_featured: boolean;

  // Display order within portfolio
  @Column({ type: "int", default: 0 })
  display_order: number;

  @Column({ type: "varchar", default: PortfolioItemStatus.APPROVED })
  status: string; // student items start as DRAFT, teacher items start as APPROVED

  // Approval workflow — for student-curated items
  @Column({ type: "uuid", nullable: true })
  approved_by: string;

  @Column({ type: "timestamptz", nullable: true })
  approved_at: Date;

  @Column({ type: "text", nullable: true })
  rejection_feedback: string; // Growth Mindset language — returned to student

  // Date of the achievement/event (may differ from created_at)
  @Column({ type: "date", nullable: true })
  achievement_date: string;
}
