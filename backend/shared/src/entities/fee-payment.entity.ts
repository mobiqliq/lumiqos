import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FeeInvoice } from './fee-invoice.entity';

@Entity()
export class FeePayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    invoice_id: string;

    @ManyToOne(() => FeeInvoice)
    @JoinColumn({ name: 'invoice_id' })
    invoice: FeeInvoice;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @CreateDateColumn()
    payment_date: Date;
}
