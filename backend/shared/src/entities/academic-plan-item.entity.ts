import { Index } from 'typeorm';
import { Entity, Column } from 'typeorm';
import { LumiqosBaseEntity } from './base.entity';

@Index(['plan_id'])
@Index(['planned_date'])
@Entity('academic_plan_item')
export class AcademicPlanItem extends LumiqosBaseEntity {
  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'int' })
  topic_index: number;

  @Column({ type: 'date' })
  planned_date: string;

  @Column({ type: 'int', default: 1 })
  session_count: number;
}
