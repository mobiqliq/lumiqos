import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum WellbeingSignalType {
  ATTENDANCE_DROP = 'attendance_drop',
  MASTERY_REGRESSION = 'mastery_regression',
  ENGAGEMENT_DROP = 'engagement_drop',
  HOMEWORK_DECLINE = 'homework_decline',
  RETRIEVAL_AVOIDANCE = 'retrieval_avoidance',
  SEL_CONCERN = 'sel_concern',
  COMBINED = 'combined', // Multiple signals firing simultaneously
}

export enum WellbeingTier {
  TIER_1 = 'tier_1', // Teacher awareness + monitoring
  TIER_2 = 'tier_2', // Counselor involvement
  TIER_3 = 'tier_3', // Principal + parent + counselor
}

export enum WellbeingFlagStatus {
  OPEN = 'open',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

@Entity('wellbeing_flag')
@Index(['school_id', 'student_id', 'status'])
@Index(['school_id', 'tier', 'status'])
@Index(['school_id', 'academic_year_id', 'signal_type'])
export class WellbeingFlag extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'enum', enum: WellbeingSignalType })
  signal_type: WellbeingSignalType;

  @Column({ type: 'enum', enum: WellbeingTier })
  tier: WellbeingTier;

  @Column({ type: 'enum', enum: WellbeingFlagStatus, default: WellbeingFlagStatus.OPEN })
  status: WellbeingFlagStatus;

  // Route to: teacher | counselor | principal
  @Column({ type: 'varchar', length: 50 })
  route_to: string;

  // Signal values that triggered the flag — explainable
  // [{ signal: 'attendance_rate', value: 58, threshold: 75, delta: -17 }]
  @Column({ type: 'jsonb' })
  signals: Record<string, any>[];

  // Trauma-informed response guide key
  @Column({ type: 'varchar', length: 100, nullable: true })
  guide_key: string;

  // Composite severity score 0-100
  @Column({ type: 'float' })
  severity_score: number;

  // RULE: System flags, NEVER diagnoses
  @Column({ type: 'text', nullable: true })
  system_note: string;

  // Care team notes (added by counselor/principal — confidential)
  @Column({ type: 'jsonb', default: [] })
  care_notes: Record<string, any>[];

  // Acknowledged by care team member
  @Column({ type: 'boolean', default: false })
  is_acknowledged: boolean;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  resolved_by: string;
}
