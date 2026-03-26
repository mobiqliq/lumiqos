import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { LessonPlan } from './lesson-plan.entity';

@Entity()
export class CurriculumMapping {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    class_id: string;

    @Column()
    subject_id: string;

    @Column()
    teacher_id: string;

    @Column({ nullable: true })
    lesson_plan_id: string;

    @Column({ type: 'date' })
    mapping_date: string;

    @Column({ type: 'varchar' })
    topic: string;

    @Column({ type: 'int', default: 1 })
    unit_number: number;

    @Column({ type: 'varchar', default: 'scheduled' }) // scheduled, completed, skipped, modified
    status: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @ManyToOne(() => LessonPlan, { nullable: true })
    @JoinColumn({ name: 'lesson_plan_id' })
    lessonPlan: LessonPlan;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
