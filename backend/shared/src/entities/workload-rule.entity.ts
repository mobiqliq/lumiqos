import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('workload_rule')
@Index(['school_id'], { unique: true })
export class WorkloadRule extends XceliQosBaseEntity {
  // Max teaching periods per day
  @Column({ type: 'int', default: 6 })
  max_periods_per_day: number;

  // Max consecutive periods without a break
  @Column({ type: 'int', default: 3 })
  max_consecutive_periods: number;

  // Min break slots between consecutive teaching blocks
  @Column({ type: 'int', default: 1 })
  min_break_slots: number;

  // Max substitutions per week
  @Column({ type: 'int', default: 3 })
  max_substitutions_per_week: number;

  // Max total periods per week (teaching + substitutions)
  @Column({ type: 'int', default: 30 })
  max_periods_per_week: number;

  // Amber threshold: workload score >= this = amber
  @Column({ type: 'int', default: 60 })
  amber_threshold: number;

  // Red threshold: workload score >= this = red
  @Column({ type: 'int', default: 80 })
  red_threshold: number;

  // Block assignment if rule violated (true = hard block, false = warn only)
  @Column({ type: 'boolean', default: false })
  hard_block_on_violation: boolean;

  // Applies to all staff or specific roles
  @Column({ type: 'jsonb', default: ['teacher'] })
  applies_to_roles: string[];
}
