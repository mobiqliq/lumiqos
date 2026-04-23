import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('weekly_timetable')
export class WeeklyTimetable extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    subject_id: string;

    @Column({ type: 'uuid' })
    teacher_id: string;

    @Column({ type: 'uuid' })
    timetable_period_id: string;

    @Column({ type: 'int' })
    day_of_week: number; // 0=Sun, 1=Mon ... 6=Sat

    @Column({ type: 'varchar', nullable: true })
    day_cycle_label: string; // 'A', 'B', or null for fixed timetable

    @Column({ type: 'varchar', nullable: true })
    room_number: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;
}
