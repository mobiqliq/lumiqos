import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AcademicPlanItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    plan_id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    subject_id: string;

    @Column({ type: 'int' })
    topic_index: number; // 1 -> total_topics

    @Column({ type: 'date' })
    planned_date: string;

    @Column({ type: 'int', default: 1 })
    session_count: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
