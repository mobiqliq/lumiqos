import { Index } from 'typeorm';
import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Index(['school_id', 'academic_year_id', 'class_id', 'subject_id'])
@Entity('academic_plan')
export class AcademicPlan extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'boolean', default: false })
  is_baseline: boolean;

  @Column({ type: 'varchar', default: 'draft' })
  status: string; // 'draft', 'generated', 'approved', 'infeasible'

  @Column({ type: 'uuid', nullable: true })
  parent_plan_id: string; // Used for disruption mode (Adjusted Plans)
}
