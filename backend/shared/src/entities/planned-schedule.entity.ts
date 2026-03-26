import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { LessonPlan } from './lesson-plan.entity';
import { SchoolCalendar } from './school-calendar.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { TimeSlot } from './time-slot.entity';

export enum ScheduleStatus {
    SCHEDULED = 'Scheduled',
    COMPLETED = 'Completed',
    DELAYED = 'Delayed',
    SKIPPED = 'Skipped'
}

@Entity('planned_schedule')
export class PlannedSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    school_id: string;

    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'uuid', nullable: true })
    section_id: string;

    @Column({ type: 'uuid', nullable: true })
    lesson_id: string;

    @Column({ type: 'uuid', nullable: true })
    calendar_id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    subject_id: string;

    @Column({ type: 'date' })
    planned_date: string;

    @Column({ type: 'date', nullable: true })
    actual_completion_date: string;

    @Column({ type: 'int', default: 0 })
    deviation_days: number;

    @Column({ type: 'varchar', nullable: true })
    title_override: string; // Used for "Revision", "Unit Test", etc.

    @Column({ type: 'uuid', nullable: true })
    teacher_id: string;

    @Column({ type: 'uuid', nullable: true })
    slot_id: string;

    @Column({
        type: 'enum',
        enum: ScheduleStatus,
        default: ScheduleStatus.SCHEDULED
    })
    status: ScheduleStatus;


    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => AcademicYear)
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @ManyToOne(() => LessonPlan)
    @JoinColumn({ name: 'lesson_id' })
    lesson: LessonPlan;

    @ManyToOne(() => SchoolCalendar)
    @JoinColumn({ name: 'calendar_id' })
    calendar: SchoolCalendar;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @ManyToOne(() => TimeSlot)
    @JoinColumn({ name: 'slot_id' })
    slot: TimeSlot;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
