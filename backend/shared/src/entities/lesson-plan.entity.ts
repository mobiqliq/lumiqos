import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { CurriculumUnit } from './curriculum-unit.entity';

console.log('LOADING LESSON PLAN ENTITY FROM SHARED/SRC');
@Entity('lesson_plans_v3')
export class LessonPlan {
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

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    learning_outcome: string;

    @Column({ type: 'int', default: 40 })
    estimated_minutes: number;

    @Column({ type: 'int', default: 5 })
    complexity_index: number; // 1-10

    @Column({ type: 'uuid', nullable: true })
    unit_id: string;

    @ManyToOne(() => CurriculumUnit, (u) => u.lessons)
    @JoinColumn({ name: 'unit_id' })
    unit: CurriculumUnit;

    @Column({ type: 'jsonb', nullable: true })
    plan_data: any; // Contains objective, structure, and exitTicket JSON

    @Column({ type: 'text', array: true, default: '{}' })
    tags: string[]; // AIL, SDG, etc.

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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
