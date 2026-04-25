import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum Chronotype {
  LARK = "lark",           // early morning peak
  INTERMEDIATE = "intermediate", // mid-morning peak
  OWL = "owl"              // afternoon/evening peak
}

@Entity("chronobio_config")
@Index(["school_id", "student_id"], { unique: true })
export class ChronobioConfig extends XceliQosBaseEntity {
  // null student_id = school-wide default
  @Column({ type: "uuid", nullable: true })
  student_id: string;

  @Column({ type: "varchar", default: Chronotype.INTERMEDIATE })
  chronotype: string;

  // Peak learning window — primary (HH:MM, school-local time, IANA tz applied at render)
  @Column({ type: "time", default: "09:00" })
  primary_peak_start: string;

  @Column({ type: "time", default: "11:00" })
  primary_peak_end: string;

  // Secondary peak window (optional — e.g. post-lunch recovery for owls)
  @Column({ type: "time", nullable: true })
  secondary_peak_start: string;

  @Column({ type: "time", nullable: true })
  secondary_peak_end: string;

  // Trough window — lowest alertness, avoid high cognitive load content
  @Column({ type: "time", nullable: true })
  trough_start: string;

  @Column({ type: "time", nullable: true })
  trough_end: string;

  // Recommended recovery break duration (minutes)
  @Column({ type: "int", default: 10 })
  recovery_break_minutes: number;

  // Whether this is AI-inferred or manually set
  @Column({ type: "boolean", default: false })
  is_ai_inferred: boolean;

  // Whether a teacher/admin has reviewed and approved this config
  @Column({ type: "boolean", default: false })
  is_approved: boolean;

  @Column({ type: "uuid", nullable: true })
  approved_by: string;

  @Column({ type: "timestamptz", nullable: true })
  approved_at: Date;

  // Whether to apply this config to timetable optimizer
  @Column({ type: "boolean", default: false })
  apply_to_timetable: boolean;

  // Data basis — how many performance observations drove this inference
  @Column({ type: "int", default: 0 })
  inference_data_points: number;
}
