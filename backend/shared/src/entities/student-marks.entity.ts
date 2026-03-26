import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class StudentMarks {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    marks_id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    exam_subject_id: string;

    @Column({ type: 'float', nullable: true })
    marks_obtained: number | null; // explicitly nullable

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @Column({ type: 'varchar', nullable: true })
    grade: string | null; // explicitly nullable

    @Column({ type: 'text', nullable: true })
    remarks: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
