import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { School } from './school.entity';
import { Subject } from './subject.entity';
import { LessonPlan } from './lesson-plan.entity';

@Entity('curriculum_units')
export class CurriculumUnit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    school_id: string;

    @Column({ type: 'uuid' })
    subject_id: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'int', default: 0 })
    weightage: number; // Marks assigned by board

    @Column({ type: 'int', default: 0 })
    sequence_order: number;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @OneToMany(() => LessonPlan, (l) => l.unit)
    lessons: LessonPlan[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
