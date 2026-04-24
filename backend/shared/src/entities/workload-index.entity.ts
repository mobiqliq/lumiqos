import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum WorkloadRiskLevel {
  GREEN = 'green',
  AMBER = 'amber',
  RED = 'red',
}

@Entity('workload_index')
@Index(['school_id', 'staff_id', 'week_start_date'], { unique: true })
@Index(['school_id', 'risk_level'])
export class WorkloadIndex extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  staff_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  // ISO week start date (Monday)
  @Column({ type: 'date' })
  week_start_date: string;

  @Column({ type: 'date' })
  week_end_date: string;

  // Raw signals
  @Column({ type: 'int', default: 0 })
  periods_taught: number;

  @Column({ type: 'int', default: 0 })
  substitutions_taken: number;

  @Column({ type: 'int', default: 0 })
  correction_queue_depth: number;

  @Column({ type: 'int', default: 0 })
  consecutive_periods_max: number;

  @Column({ type: 'int', default: 0 })
  planning_sessions: number;

  // Days with no break (consecutive periods with no gap)
  @Column({ type: 'int', default: 0 })
  days_without_break: number;

  // Composite workload score 0-100
  @Column({ type: 'float', default: 0 })
  workload_score: number;

  @Column({ type: 'enum', enum: WorkloadRiskLevel, default: WorkloadRiskLevel.GREEN })
  risk_level: WorkloadRiskLevel;

  // Rule violations this week
  @Column({ type: 'jsonb', default: [] })
  violations: Record<string, any>[];

  // Recommended action
  @Column({ type: 'text', nullable: true })
  recommendation: string;

  // Acknowledged by principal
  @Column({ type: 'boolean', default: false })
  is_acknowledged: boolean;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by: string;
}
