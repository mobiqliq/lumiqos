import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AcademicYear {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'uuid', nullable: true })
    academic_year_id: string;

    @Column({ type: 'varchar', nullable: true })
    year_name: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'timestamp', nullable: true })
    start_date: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_date: Date;

    @Column({ type: 'varchar', nullable: true })
    status: string; // Changed from Enum to string for better compatibility during restoration

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
