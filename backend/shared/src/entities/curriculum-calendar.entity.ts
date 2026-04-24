import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum CurriculumCalendarStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum RegulatoryFramework {
  NEP = 'NEP',                         // India National Education Policy
  COMMON_CORE = 'COMMON_CORE',         // USA
  NATIONAL_CURRICULUM = 'NATIONAL_CURRICULUM', // UK
  IB_MYP = 'IB_MYP',                  // IB Middle Years
  IB_DP = 'IB_DP',                    // IB Diploma
  CAMBRIDGE_IGCSE = 'CAMBRIDGE_IGCSE',
  CAMBRIDGE_AS_A = 'CAMBRIDGE_AS_A',
  AUSTRALIAN_AC = 'AUSTRALIAN_AC',     // Australian Curriculum
  CUSTOM = 'custom',                   // School-defined
}

@Entity('curriculum_calendar')
@Index(['school_id', 'academic_year_id', 'class_id', 'subject_id'], { unique: true })
export class CurriculumCalendar extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'uuid' })
  school_curriculum_map_id: string;

  // Regulatory framework for compliance enforcement
  @Column({ type: 'enum', enum: RegulatoryFramework, default: RegulatoryFramework.CUSTOM })
  regulatory_framework: RegulatoryFramework;

  // Minimum periods required by framework (0 = no enforcement)
  @Column({ type: 'int', default: 0 })
  min_periods_required: number;

  // Calendar stats (computed at generation/publish time)
  @Column({ type: 'int', default: 0 })
  total_planned_periods: number;

  @Column({ type: 'int', default: 0 })
  total_taught_periods: number;

  @Column({ type: 'int', default: 0 })
  total_missed_periods: number;

  // NEP / framework compliance
  @Column({ type: 'boolean', default: false })
  is_compliant: boolean;

  @Column({ type: 'jsonb', nullable: true })
  compliance_issues: Record<string, any>[];

  @Column({ type: 'enum', enum: CurriculumCalendarStatus, default: CurriculumCalendarStatus.DRAFT })
  status: CurriculumCalendarStatus;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'uuid', nullable: true })
  published_by: string;

  // Timezone — critical for global schools
  // IANA timezone string: 'Asia/Kolkata', 'America/New_York', 'Europe/London'
  @Column({ type: 'varchar', length: 100, default: 'Asia/Kolkata' })
  timezone: string;

  // Last rebalance metadata
  @Column({ type: 'timestamp', nullable: true })
  last_rebalanced_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  rebalance_summary: Record<string, any>;
}
