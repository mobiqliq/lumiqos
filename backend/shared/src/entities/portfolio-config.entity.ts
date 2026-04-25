import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("portfolio_config")
@Index(["school_id"], { unique: true })
export class PortfolioConfig extends XceliQosBaseEntity {
  // Self-curation eligibility — age and grade thresholds (school-configurable)
  @Column({ type: "int", default: 11 })
  self_curation_min_age: number;

  @Column({ type: "int", default: 6 })
  self_curation_min_grade: number;

  // Allowed item types — school can restrict
  @Column({ type: "jsonb", default: [
    "exam_result", "homework", "project", "co_curricular",
    "reflection", "skill_mastery", "sel_observation",
    "award", "community_service", "creative_work", "external"
  ] })
  allowed_item_types: string[];

  // Allowed visibility options — school can restrict max visibility
  @Column({ type: "jsonb", default: ["private", "class", "school", "parent"] })
  allowed_visibility_options: string[];

  // Whether public sharing (share_token) is permitted at this school
  @Column({ type: "boolean", default: false })
  public_sharing_enabled: boolean;

  // Consent jurisdiction for public sharing
  @Column({ type: "varchar", nullable: true })
  sharing_consent_jurisdiction: string; // GDPR | DPDP | FERPA | PIPEDA | OTHER

  // Whether parent report visibility is enabled
  @Column({ type: "boolean", default: true })
  parent_visibility_enabled: boolean;

  // Approval required for student-curated items before visibility beyond private
  @Column({ type: "boolean", default: true })
  student_item_approval_required: boolean;

  // Mandatory item types per academic year — school can require certain sections
  // jsonb: [{ item_type, min_count, label }]
  @Column({ type: "jsonb", default: [] })
  mandatory_sections: Record<string, any>[];

  // Export formats enabled at this school
  @Column({ type: "jsonb", default: ["pdf", "json"] })
  enabled_export_formats: string[];

  // Whether portfolio feeds XceliQScore co_curricular_engagement dimension
  @Column({ type: "boolean", default: true })
  feed_xceliq_score: boolean;

  // Max file size for file_ref uploads (MB) — enforced at API layer
  @Column({ type: "int", default: 10 })
  max_file_size_mb: number;

  // Whether AI-assisted Growth Mindset narrative generation is enabled
  @Column({ type: "boolean", default: true })
  ai_narrative_enabled: boolean;

  // Student reflection prompt — localised per school
  @Column({ type: "text", nullable: true })
  reflection_prompt: string;
}
