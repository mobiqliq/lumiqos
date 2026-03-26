import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    first_name: string;

    @Column({ type: 'varchar' })
    last_name: string;

    @Column({ type: 'varchar', nullable: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true, unique: true })
    lumiq_id: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    admission_number: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @Column({ type: 'int', default: 0 })
    xp: number;

    @Column({ type: 'int', default: 1 })
    level: number;

    @Column({ type: 'int', default: 0 })
    streak_days: number;

    @Column({ type: 'jsonb', nullable: true })
    skill_tree: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
