import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TenantSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    plan_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    current_period_end: Date;
}
