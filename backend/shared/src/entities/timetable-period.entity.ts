import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum PeriodType {
    PERIOD = 'period',
    BREAK = 'break',
    RECESS = 'recess',
    ASSEMBLY = 'assembly',
    CO_CURRICULAR = 'co_curricular',
}

@Entity('timetable_period')
export class TimetablePeriod extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'varchar', nullable: true })
    day_cycle_label: string; // 'A', 'B', or null for fixed

    @Column({ type: 'int' })
    order_index: number; // 1-based position in the day

    @Column({ type: 'varchar' })
    label: string; // 'Period 1', 'Lunch Break', etc.

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ type: 'int' })
    duration_minutes: number;

    @Column({
        type: 'enum',
        enum: PeriodType,
        default: PeriodType.PERIOD,
    })
    period_type: PeriodType;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;
}
