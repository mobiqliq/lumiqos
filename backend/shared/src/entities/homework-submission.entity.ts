import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HomeworkAssignment } from './homework-assignment.entity';

@Entity()
export class HomeworkSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    submission_id: string;

    @Column({ type: 'varchar', nullable: true })
    homework_id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'text', nullable: true })
    submission_text: string;

    @Column({ type: 'varchar', nullable: true })
    submission_file_url: string;

    @Column({ type: 'text', nullable: true })
    teacher_remark: string;

    @Column({ type: 'text', nullable: true })
    teacher_feedback: string;

    @Column({ type: 'jsonb', nullable: true })
    submission_data: any;

    @Column({ type: 'varchar', nullable: true })
    grade: string;

    @Column({ type: 'timestamp', nullable: true })
    graded_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    submitted_at: Date;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @ManyToOne(() => HomeworkAssignment)
    @JoinColumn({ name: 'homework_id' })
    homework: HomeworkAssignment;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
