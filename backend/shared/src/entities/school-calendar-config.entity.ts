import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum TimetableType {
    FIXED = 'fixed',
    ROTATING = 'rotating',
}

@Entity('school_calendar_config')
export class SchoolCalendarConfig extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'date' })
    year_start_date: string;

    @Column({ type: 'date' })
    year_end_date: string;

    @Column({ type: 'jsonb', default: [] })
    exam_windows: {
        label: string;
        start_date: string;
        end_date: string;
        type: 'pre_mid' | 'mid' | 'pre_annual' | 'annual';
    }[];

    @Column({ type: 'jsonb', default: [] })
    school_event_days: {
        label: string;
        date: string;
        is_working_day: boolean;
    }[];

    @Column({ type: 'jsonb', default: [] })
    state_holidays: {
        label: string;
        date: string;
        principal_override: boolean;
    }[];

    @Column({ type: 'int', default: 5 })
    working_days_per_week: number;

    @Column({ type: 'jsonb', default: [1, 2, 3, 4, 5] })
    working_day_numbers: number[]; // 0=Sun, 1=Mon ... 6=Sat

    @Column({
        type: 'enum',
        enum: TimetableType,
        default: TimetableType.FIXED,
    })
    timetable_type: TimetableType;

    @Column({ type: 'int', default: 1 })
    day_cycle_length: number; // 1 for fixed, 2 for A/B cycle

    @Column({ type: 'boolean', default: false })
    is_published: boolean;
}
