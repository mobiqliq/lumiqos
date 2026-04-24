import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum PredictionType {
  DROPOUT_RISK = 'dropout_risk',
  ASSESSMENT_FAILURE = 'assessment_failure',
  FEE_DEFAULT = 'fee_default',
  TEACHER_BURNOUT = 'teacher_burnout',
  CURRICULUM_SHORTFALL = 'curriculum_shortfall',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('predictive_alert')
@Index(['school_id', 'prediction_type', 'risk_level'])
@Index(['school_id', 'subject_id', 'prediction_type'])
@Index(['school_id', 'academic_year_id', 'prediction_type'])
export class PredictiveAlert extends XceliQosBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  academic_year_id: string;

  @Column({ type: 'enum', enum: PredictionType })
  prediction_type: PredictionType;

  // Subject of prediction — student_id, staff_id, or class_id depending on type
  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'varchar', length: 50 })
  subject_type: string; // 'student' | 'staff' | 'class'

  @Column({ type: 'enum', enum: RiskLevel })
  risk_level: RiskLevel;

  // Risk score 0-100
  @Column({ type: 'float' })
  risk_score: number;

  // Explainable factors driving the prediction
  // [{ factor: 'attendance_rate', value: 0.62, weight: 0.4, contribution: 'high' }]
  @Column({ type: 'jsonb' })
  factors: Record<string, any>[];

  // Actionable recommendation
  @Column({ type: 'text', nullable: true })
  recommendation: string;

  // Who should act on this alert
  @Column({ type: 'varchar', length: 50, nullable: true })
  route_to: string; // 'counselor' | 'principal' | 'teacher' | 'finance' | 'hr'

  // Acknowledged by a human
  @Column({ type: 'boolean', default: false })
  is_acknowledged: boolean;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date;

  // Last time this prediction was computed
  @Column({ type: 'timestamp' })
  computed_at: Date;

  // Previous risk level (for trend tracking)
  @Column({ type: 'enum', enum: RiskLevel, nullable: true })
  previous_risk_level: RiskLevel;

  @Column({ type: 'float', nullable: true })
  previous_risk_score: number;
}
