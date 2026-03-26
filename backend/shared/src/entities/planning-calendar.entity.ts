import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AcademicPlan } from './academic-plan.entity';

@Entity()
export class PlanningCalendar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    plan_id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'varchar' })
    type: string; // WORKING_DAY, HOLIDAY, EXAM, REVISION

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @ManyToOne(() => AcademicPlan)
    @JoinColumn({ name: 'plan_id' })
    plan: AcademicPlan;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
