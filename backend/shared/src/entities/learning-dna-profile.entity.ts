import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum GardnerIntelligence {
  LINGUISTIC = "linguistic",
  LOGICAL_MATHEMATICAL = "logical_mathematical",
  SPATIAL = "spatial",
  MUSICAL = "musical",
  BODILY_KINESTHETIC = "bodily_kinesthetic",
  INTERPERSONAL = "interpersonal",
  INTRAPERSONAL = "intrapersonal",
  NATURALIST = "naturalist"
}

export enum DNAProfileStatus {
  DRAFT = "draft",           // insufficient observations
  PROVISIONAL = "provisional", // 3-5 observations
  ESTABLISHED = "established", // 6+ observations, AI-confirmed
  REVIEWED = "reviewed"      // teacher-reviewed and approved
}

@Entity("learning_dna_profile")
@Index(["school_id", "student_id", "academic_year_id"], { unique: true })
export class LearningDNAProfile extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  student_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  // Gardner 8 intelligence scores — 0.00 to 100.00 each
  // Populated by aggregating LearningDNAObservations + AI inference
  @Column({ type: "jsonb", default: {} })
  gardner_scores: {
    linguistic?: number;
    logical_mathematical?: number;
    spatial?: number;
    musical?: number;
    bodily_kinesthetic?: number;
    interpersonal?: number;
    intrapersonal?: number;
    naturalist?: number;
  };

  // Top 3 dominant intelligences — derived, not stored raw
  @Column({ type: "jsonb", default: [] })
  dominant_intelligences: string[]; // GardnerIntelligence[]

  // Sweller cognitive load index — 0.00 to 100.00
  // Higher = higher intrinsic + extraneous load observed
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  cognitive_load_index: number;

  // Chronobio peak learning window — derived from ChronobioConfig + performance data
  @Column({ type: "varchar", nullable: true })
  chronotype: string; // lark | owl | intermediate

  @Column({ type: "time", nullable: true })
  peak_start: string; // HH:MM — timezone-naive, school tz applied at render

  @Column({ type: "time", nullable: true })
  peak_end: string;

  // Preferred modalities — ranked jsonb: [{ modality, strength }]
  // visual | auditory | reading_writing | kinesthetic (VARK)
  @Column({ type: "jsonb", default: [] })
  modality_preferences: Record<string, any>[];

  // Observation count driving this profile
  @Column({ type: "int", default: 0 })
  observation_count: number;

  @Column({ type: "varchar", default: DNAProfileStatus.DRAFT })
  status: string;

  // Teacher who last reviewed/approved
  @Column({ type: "uuid", nullable: true })
  reviewed_by: string;

  @Column({ type: "timestamptz", nullable: true })
  reviewed_at: Date;

  // AI-generated Growth Mindset narrative — human-approved before display
  @Column({ type: "text", nullable: true })
  strength_narrative: string;

  @Column({ type: "boolean", default: false })
  narrative_approved: boolean;

  @Column({ type: "timestamptz", nullable: true })
  last_computed_at: Date;

  // Timetable optimizer eligibility flag
  @Column({ type: "boolean", default: false })
  chronobio_timetable_eligible: boolean;
}
