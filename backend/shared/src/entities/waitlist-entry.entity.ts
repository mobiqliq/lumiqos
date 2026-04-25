import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum WaitlistStatus {
  ACTIVE = "active",
  OFFERED = "offered",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  WITHDRAWN = "withdrawn",
}

export enum WaitlistPriorityBasis {
  DATE = "date",           // First come first served
  MERIT = "merit",         // Assessment score
  SIBLING = "sibling",     // Sibling preference
  QUOTA = "quota",         // Regulatory quota
  OTHER = "other",
}

@Entity("waitlist_entry")
@Index(["school_id", "academic_year_id", "class_id", "status"])
@Index(["school_id", "application_id"], { unique: true })
export class WaitlistEntry extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  application_id: string;

  @Column({ type: "uuid" })
  academic_year_id: string;

  @Column({ type: "uuid" })
  class_id: string;

  @Column({ type: "enum", enum: WaitlistStatus, default: WaitlistStatus.ACTIVE })
  status: WaitlistStatus;

  @Column({ type: "enum", enum: WaitlistPriorityBasis, default: WaitlistPriorityBasis.DATE })
  priority_basis: WaitlistPriorityBasis;

  // Quota category if priority_basis = quota
  @Column({ type: "varchar", nullable: true })
  quota_category: string;

  // Position in waitlist (recomputed on changes)
  @Column({ type: "int" })
  position: number;

  // Score used for merit-based ordering
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  merit_score: number;

  // Auto-promotion: when a seat becomes available, offer is auto-sent
  @Column({ type: "boolean", default: true })
  auto_promote: boolean;

  // Offer sent timestamp
  @Column({ type: "timestamp", nullable: true })
  offer_sent_at: Date;

  // Offer expiry — if not accepted by this date, next candidate promoted
  @Column({ type: "timestamp", nullable: true })
  offer_expires_at: Date;

  @Column({ type: "timestamp", nullable: true })
  responded_at: Date;

  @Column({ type: "text", nullable: true })
  notes: string;
}
