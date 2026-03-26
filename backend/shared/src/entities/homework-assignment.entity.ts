import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class HomeworkAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    homework_id: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', default: 'homework' }) // homework, quest, exit_ticket
    type: string;

    @Column({ type: 'int', default: 0 })
    reward_xp: number;

    @Column({ type: 'varchar', nullable: true }) // e.g., 'Academic', 'Physical', 'Creativity', 'Analytical'
    skill_category: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    teacher_id: string;

    @Column({ type: 'varchar', nullable: true })
    class_id: string;

    @Column({ type: 'varchar', nullable: true })
    section_id: string;

    @Column({ type: 'varchar', nullable: true })
    subject_id: string;

    @Column({ type: 'timestamp', nullable: true })
    assigned_date: Date;

    @Column({ type: 'timestamp', nullable: true })
    due_date: Date;

    @Column({ type: 'varchar', nullable: true })
    attachment_url: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
