import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class StudentFeeAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    academic_year_id: string; // Added academic_year_id

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_fee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
