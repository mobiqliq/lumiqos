import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("reservation_config")
@Index(["school_id", "academic_year_id", "class_id", "quota_category"], { unique: true })
export class ReservationConfig extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "uuid", nullable: true })
  class_id: string; // null = applies to all classes

  // Free-form quota category: RTE_IN | EWS_IN | SEND_UK | IEP_US | INDIGENOUS_AU | custom
  @Column({ type: "varchar" })
  quota_category: string;

  // Human-readable label for this quota
  @Column({ type: "varchar" })
  label: string;

  // Regulatory framework reference: NEP_IN | SEND_UK | IDEA_US | DDA_AU | custom
  @Column({ type: "varchar", nullable: true })
  regulatory_framework: string;

  // Percentage of seats reserved (0-100)
  @Column({ type: "decimal", precision: 5, scale: 2 })
  reservation_percentage: number;

  // Absolute seat cap (if set, overrides percentage when lower)
  @Column({ type: "int", nullable: true })
  max_seats: number;

  // Total seats in this class for this year
  @Column({ type: "int", nullable: true })
  total_seats: number;

  // Seats filled under this quota
  @Column({ type: "int", default: 0 })
  seats_filled: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  // Required documents for this quota jsonb: [{ document_type, is_mandatory }]
  @Column({ type: "jsonb", default: [] })
  required_documents: Record<string, any>[];

  // Compliance notes
  @Column({ type: "text", nullable: true })
  notes: string;
}
