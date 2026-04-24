import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('forgetting_curve')
@Index(['school_id', 'student_id', 'board_topic_id'], { unique: true })
@Index(['school_id', 'student_id', 'next_review_date'])
export class ForgettingCurve extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'varchar', length: 255 })
  board_topic_id: string;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  // SM-2 algorithm state
  // Ease factor: starts at 2.5, modified by quality scores
  // EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)), min 1.3
  @Column({ type: 'float', default: 2.5 })
  ease_factor: number;

  // Current interval in days
  @Column({ type: 'int', default: 1 })
  interval_days: number;

  // Number of successful repetitions in a row
  @Column({ type: 'int', default: 0 })
  repetition_count: number;

  // Ebbinghaus stability S — higher = slower forgetting
  @Column({ type: 'float', default: 1.0 })
  stability: number;

  // Current retrievability R (0-1) — decays over time
  // R = e^(-t/S) where t = days since last review
  @Column({ type: 'float', default: 1.0 })
  retrievability: number;

  @Column({ type: 'date', nullable: true })
  last_review_date: string;

  @Column({ type: 'date', nullable: true })
  next_review_date: string;

  // Total review sessions
  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  // Average quality score across all reviews
  @Column({ type: 'float', nullable: true })
  average_quality: number;

  // Initial mastery level when topic was first learned (from StudentConceptMastery)
  @Column({ type: 'float', nullable: true })
  initial_mastery: number;

  // At-risk flag: retrievability < 0.3
  @Column({ type: 'boolean', default: false })
  is_at_risk: boolean;

  // Growth Mindset note: shown to student with task
  @Column({ type: 'text', nullable: true })
  encouragement_note: string;
}
