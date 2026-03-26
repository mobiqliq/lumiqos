import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';

@Entity()
export class InventoryItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'int' })
    current_stock: number;

    @Column({ type: 'varchar' })
    unit: string;

    @Column({ type: 'varchar' })
    usage_rate: string;

    @Column({ type: 'varchar', nullable: true })
    run_out_prediction: string;

    @Column({ type: 'varchar', default: 'Healthy' }) // Healthy, Warning, Critical
    status: string;

    @Column({ type: 'varchar', nullable: true })
    vendor: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
