import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ConsentStatus {
    GRANTED = 'granted',
    REVOKED = 'revoked',
    PENDING = 'pending',
}

@Entity('student_identity')
@Index(['federated_id'], { unique: true })
export class StudentIdentity extends XceliQosBaseEntity {
    @Column({ type: 'varchar', unique: true })
    federated_id: string; // Global XceliQ ID — above school_id

    @Column({ type: 'uuid' })
    student_id: string; // FK to Student.id (current school)

    @Column({ type: 'varchar', nullable: true })
    xceliq_id: string; // mirrors Student.xceliq_id for join

    @Column({ type: 'date', nullable: true })
    date_of_birth: string;

    @Column({ type: 'varchar', nullable: true })
    gender: string;

    @Column({ type: 'varchar', nullable: true })
    nationality: string;

    @Column({
        type: 'enum',
        enum: ConsentStatus,
        default: ConsentStatus.PENDING,
    })
    passport_consent: ConsentStatus;

    @Column({ type: 'boolean', default: false })
    transfer_consent: boolean;

    @Column({ type: 'jsonb', default: [] })
    school_history: {
        school_id: string;
        school_name: string;
        from_date: string;
        to_date: string | null;
        is_current: boolean;
    }[];

    @Column({ type: 'timestamp', nullable: true })
    consent_granted_at: Date;

    @Column({ type: 'uuid', nullable: true })
    consent_granted_by: string;
}
