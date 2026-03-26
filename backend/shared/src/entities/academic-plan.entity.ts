import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AcademicPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    school_id: string;

    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ type: 'uuid', nullable: true })
    subject_id: string;

    @Column({ type: 'int', default: 1 })
    version: number;

    @Column({ type: 'boolean', default: false })
    is_baseline: boolean;

    @Column({ type: 'uuid', nullable: true })
    parent_plan_id: string;

    @Column({ type: 'varchar', default: 'draft' }) // draft, generated, approved, infeasible
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
