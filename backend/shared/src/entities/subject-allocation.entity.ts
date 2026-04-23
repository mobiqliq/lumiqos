import { Entity, Column } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('subject_allocation')
export class SubjectAllocation extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'uuid' })
    class_id: string;

    @Column({ type: 'uuid' })
    subject_id: string;

    @Column({ type: 'int' })
    periods_per_week: number;

    @Column({ type: 'int', nullable: true })
    nep_minimum_periods_per_week: number;

    @Column({ type: 'boolean', default: false })
    is_nep_compliant: boolean;

    @Column({ type: 'varchar', nullable: true })
    notes: string;
}
