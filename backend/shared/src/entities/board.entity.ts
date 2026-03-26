import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('boards')
export class Board {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string; // CBSE, ICSE, etc.

    @Column({ type: 'varchar', default: 'India' })
    country: string;

    @Column({ type: 'int', default: 7 })
    exam_buffer_days: number;

    @Column({ type: 'int', default: 14 })
    revision_days: number;

    @Column({ type: 'int', default: 1 })
    max_sessions_per_day: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
