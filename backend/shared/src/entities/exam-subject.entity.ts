import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exam } from './exam.entity';

@Entity()
export class ExamSubject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    exam_subject_id: string;

    @Column({ type: 'varchar', nullable: true })
    exam_id: string;

    @Column({ type: 'varchar', nullable: true })
    subject_id: string; // Added subject_id

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    class_id: string;

    @Column({ type: 'varchar', nullable: true })
    section_id: string;

    @Column({ type: 'float', nullable: true })
    max_marks: number;

    @Column({ type: 'jsonb', nullable: true })
    ai_questions: any;

    @Column({ type: 'jsonb', nullable: true })
    bloom_taxonomy: any;

    @ManyToOne(() => Exam)
    @JoinColumn({ name: 'exam_id' })
    exam: Exam;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
