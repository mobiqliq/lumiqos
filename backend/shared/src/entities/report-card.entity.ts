import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exam } from './exam.entity';

@Entity()
export class ReportCard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    report_card_id: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'uuid', nullable: true })
    student_id: string;

    @Column({ type: 'uuid', nullable: true })
    exam_id: string;

    @ManyToOne(() => Exam)
    @JoinColumn({ name: 'exam_id' })
    exam: Exam;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ type: 'uuid', nullable: true })
    section_id: string;

    @Column({ type: 'float', nullable: true })
    total_marks: number;

    @Column({ type: 'float', nullable: true })
    percentage: number;

    @Column({ type: 'int', nullable: true })
    rank: number;

    @Column({ type: 'varchar', default: 'published' })
    status: string; // 'draft', 'published', 'signed_by_principal'

    @Column({ type: 'boolean', default: false })
    is_signed_by_principal: boolean;

    @Column({ type: 'timestamp', nullable: true })
    principal_signed_at: Date;

    @CreateDateColumn()
    created_at: Date;


    @UpdateDateColumn()
    updated_at: Date;
}
