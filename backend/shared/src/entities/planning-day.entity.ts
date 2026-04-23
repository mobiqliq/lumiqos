import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('planning_day')
export class PlanningDay extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', default: 'WORKING' })
  type: string; // 'WORKING', 'HOLIDAY', 'EXAM'
}
