import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';

export enum DayType {
    TEACHING_DAY = 'Teaching_Day',
    HOLIDAY = 'Holiday',
    ACTIVITY_DAY = 'Activity_Day',
    EXAM_DAY = 'Exam_Day',
    PRE_EXAM = 'Pre_Exam',
    POST_EVENT = 'Post_Event',
    BUFFER_DAY = 'Buffer_Day',
    BAGLESS_DAY = 'Bagless_Day'
}

@Entity('school_calendar')
@Unique(['school_id', 'date'])
export class SchoolCalendar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    school_id: string;

    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({
        type: 'enum',
        enum: DayType,
        default: DayType.TEACHING_DAY
    })
    day_type: DayType;

    @Column({ type: 'boolean', default: true })
    is_working_day: boolean;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => AcademicYear)
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
