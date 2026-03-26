import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CurriculumPlan } from './curriculum-plan.entity';
import { Syllabus } from './syllabus.entity';

@Entity()
export class CurriculumPlanItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    plan_id: string;

    @Column({ nullable: true })
    topic_id: string; // Reference to Syllabus entry or topic identifier

    @Column({ type: 'date' })
    planned_date: string;

    @Column({ type: 'int', default: 1 })
    planned_sessions: number;

    @Column({ type: 'varchar', default: 'pending' }) // pending, completed, delayed
    status: string;

    @ManyToOne(() => CurriculumPlan, plan => plan.items)
    @JoinColumn({ name: 'plan_id' })
    plan: CurriculumPlan;

    @ManyToOne(() => Syllabus, { nullable: true })
    @JoinColumn({ name: 'topic_id' })
    syllabus: Syllabus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
