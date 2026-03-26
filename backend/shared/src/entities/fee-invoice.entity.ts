import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class FeeInvoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    invoice_id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    academic_year_id: string;

    @Column({ type: 'varchar', nullable: true })
    fee_category_id: string; // Added fee_category_id

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    remaining_balance: number;

    @Column({ type: 'timestamp', nullable: true }) // Changed back to timestamp
    due_date: Date;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
