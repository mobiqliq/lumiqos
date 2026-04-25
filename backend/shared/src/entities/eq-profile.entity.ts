import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum EQProfileStatus {
  DRAFT = "draft",             // < 3 observations
  PROVISIONAL = "provisional", // 3-5 observations
  ESTABLISHED = "established", // 6+ observations
  REVIEWED = "reviewed"        // teacher/counsellor approved
}

@Entity("eq_profile")
@Index(["school_id", "student_id", "academic_year_id"], { unique: true })
export class EQProfile extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // CASEL 5 aggregated scores — 0.00 to 100.00 each
  // Weighted average of SELObservations by confidence
  @Column({ type: "jsonb", default: {} })
  casel_scores: {
    self_awareness?: number;
    self_management?: number;
    social_awareness?: number;
    relationship_skills?: number;
    responsible_decision_making?: number;
  };

  // Composite EQ index — weighted mean of CASEL 5
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  eq_index: number;

  // Previous period eq_index for growth tracking
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  previous_eq_index: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  eq_growth_delta: number;

  // Top strength competency and growth area — derived
  @Column({ type: "varchar", nullable: true })
  top_strength: string; // CASELCompetency

  @Column({ type: "varchar", nullable: true })
  growth_area: string; // CASELCompetency with lowest score

  // Flow state index — 0.00 to 100.00
  // Derived from FlowStateLog entries for this student/year
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  flow_state_index: number;

  // How many flow state events detected this year
  @Column({ type: "int", default: 0 })
  flow_state_event_count: number;

  // Observation counts
  @Column({ type: "int", default: 0 })
  observation_count: number;

  @Column({ type: "varchar", default: EQProfileStatus.DRAFT })
  status: string;

  // XceliQScore feed — these two dimensions pull from EQProfile
  // self_management_sel ← casel_scores.self_management + casel_scores.self_awareness
  // collaborative_intelligence ← casel_scores.relationship_skills + casel_scores.social_awareness
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  xceliq_self_management_sel_feed: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  xceliq_collaborative_intelligence_feed: number;

  // Reviewed by teacher/counsellor — prediction without prescription
  @Column({ type: "uuid", nullable: true })
  reviewed_by: string;

  @Column({ type: "timestamptz", nullable: true })
  reviewed_at: Date;

  // AI-generated Growth Mindset strength narrative — gated by approval
  @Column({ type: "text", nullable: true })
  strength_narrative: string;

  @Column({ type: "boolean", default: false })
  narrative_approved: boolean;

  @Column({ type: "timestamptz", nullable: true })
  last_computed_at: Date;
}
