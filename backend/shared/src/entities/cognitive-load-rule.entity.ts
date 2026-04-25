import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum CognitiveLoadTier {
  LOW = "low",       // foundational recall, routine practice
  MEDIUM = "medium", // application, analysis
  HIGH = "high"      // synthesis, evaluation, novel problem solving
}

@Entity("cognitive_load_rule")
@Index(["school_id", "rule_code"], { unique: true })
export class CognitiveLoadRule extends XceliQosBaseEntity {
  // Human-readable rule identifier
  @Column({ type: "varchar" })
  rule_code: string;

  @Column({ type: "varchar" })
  label: string;

  // Max consecutive high-load periods before mandatory recovery
  @Column({ type: "int", default: 2 })
  max_consecutive_high_load_periods: number;

  // Max consecutive medium-load periods before recommended break
  @Column({ type: "int", default: 3 })
  max_consecutive_medium_load_periods: number;

  // Minimum recovery period between high-load blocks (minutes)
  @Column({ type: "int", default: 15 })
  min_recovery_minutes: number;

  // Max total high-load periods per day
  @Column({ type: "int", default: 3 })
  max_high_load_periods_per_day: number;

  // Max total cognitive load units per day (sum of all period loads)
  // LOW=1, MEDIUM=2, HIGH=3 — configurable via load_unit_weights
  @Column({ type: "int", default: 12 })
  max_daily_load_units: number;

  // Load unit weights jsonb: { low: 1, medium: 2, high: 3 }
  @Column({ type: "jsonb", default: { low: 1, medium: 2, high: 3 } })
  load_unit_weights: Record<string, number>;

  // Applies to which school tiers (1=full staff, 2=partial, 3=minimal)
  // jsonb array of tier numbers
  @Column({ type: "jsonb", default: [1, 2, 3] })
  applicable_tiers: number[];

  // Grade band applicability — null = all grades
  // jsonb: { min_grade: 1, max_grade: 12 }
  @Column({ type: "jsonb", nullable: true })
  grade_band: Record<string, number>;

  // Whether this rule is enforced (blocks scheduling) or advisory (warns only)
  @Column({ type: "boolean", default: false })
  is_enforced: boolean;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  // Research basis reference — traceable to evidence (Sweller 1988, etc.)
  @Column({ type: "text", nullable: true })
  research_basis: string;
}
