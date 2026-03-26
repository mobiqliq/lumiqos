import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class PeriodConfiguration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    academic_year_id: string;

    @Column({ type: 'jsonb' })
    config: any; // Array of { label, startTime, endTime, type: 'period' | 'break' }

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
