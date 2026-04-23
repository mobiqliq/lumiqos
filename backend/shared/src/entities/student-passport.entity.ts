import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('student_passport')
@Index(['federated_id'], { unique: true })
export class StudentPassport extends XceliQosBaseEntity {
    @Column({ type: 'varchar', unique: true })
    federated_id: string; // FK to StudentIdentity.federated_id

    @Column({ type: 'uuid' })
    student_id: string; // FK to Student.id (current school)

    @Column({ type: 'jsonb', default: {} })
    mastery_map: Record<string, any>; // subject → topic → bloom_level → mastery_score

    @Column({ type: 'jsonb', default: [] })
    intervention_record: {
        date: string;
        school_id: string;
        type: string;
        description: string;
        outcome: string;
        recorded_by: string;
    }[];

    @Column({ type: 'jsonb', default: [] })
    xceliq_score_history: {
        date: string;
        school_id: string;
        academic_year_id: string;
        composite_score: number;
        dimensions: Record<string, number>;
    }[];

    @Column({ type: 'jsonb', default: [] })
    sel_observations: {
        date: string;
        school_id: string;
        competency: string; // CASEL competency
        observation: string;
        recorded_by: string;
    }[];

    @Column({ type: 'jsonb', default: [] })
    transfer_log: {
        from_school_id: string;
        to_school_id: string;
        transfer_date: string;
        initiated_by: string;
        consent_verified: boolean;
        audit_ref: string;
    }[];

    @Column({ type: 'timestamp', nullable: true })
    last_exported_at: Date;
}
