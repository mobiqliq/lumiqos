import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ComplianceStatus {
  MET = 'met',
  PARTIAL = 'partial',
  NOT_MET = 'not_met',
  NOT_ASSESSED = 'not_assessed',
}

@Entity('compliance_record')
@Index(['school_id', 'academic_year_id', 'indicator_id'], { unique: true })
@Index(['school_id', 'academic_year_id', 'status'])
export class ComplianceRecord extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'uuid' })
  indicator_id: string;

  @Column({ type: 'varchar', length: 50 })
  framework_id: string;

  @Column({ type: 'varchar', length: 100 })
  domain: string;

  @Column({ type: 'varchar', length: 50 })
  indicator_code: string;

  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.NOT_ASSESSED })
  status: ComplianceStatus;

  // Current measured value
  @Column({ type: 'float', nullable: true })
  current_value: number;

  // Target value (copied from indicator at assessment time)
  @Column({ type: 'float', nullable: true })
  target_value: number;

  // Evidence: auto-collected or manually entered
  @Column({ type: 'text', nullable: true })
  evidence: string;

  // Corrective action recommended
  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  // Manual override: principal can mark as met with justification
  @Column({ type: 'boolean', default: false })
  is_manually_overridden: boolean;

  @Column({ type: 'text', nullable: true })
  override_justification: string;

  @Column({ type: 'uuid', nullable: true })
  overridden_by: string;

  @Column({ type: 'timestamp', nullable: true })
  assessed_at: Date;

  @Column({ type: 'uuid', nullable: true })
  assessed_by: string;
}
