import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('compliance_indicator')
@Index(['framework_id', 'domain', 'indicator_code'], { unique: true })
export class ComplianceIndicator extends XceliQosBaseEntity {
  // e.g. NEP, CBSE, OFSTED, IB, COMMON_CORE
  @Column({ type: 'varchar', length: 50 })
  framework_id: string;

  // e.g. Infrastructure, Curriculum, Assessment, Inclusion, Governance
  @Column({ type: 'varchar', length: 100 })
  domain: string;

  // e.g. NEP_CURR_01
  @Column({ type: 'varchar', length: 50 })
  indicator_code: string;

  @Column({ type: 'varchar', length: 500 })
  indicator_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // How this is measured: percentage | count | boolean | ratio | score
  @Column({ type: 'varchar', length: 50, default: 'boolean' })
  measurement_type: string;

  // Target value (percentage, count, or 1 for boolean)
  @Column({ type: 'float', nullable: true })
  target_value: number;

  // Weight in overall score (0-1, all weights in domain sum to 1)
  @Column({ type: 'float', default: 1.0 })
  weight: number;

  // Is this indicator mandatory (cannot publish non-compliant)
  @Column({ type: 'boolean', default: false })
  is_mandatory: boolean;

  // Which data source drives this: manual | attendance | curriculum | finance | hr | exam
  @Column({ type: 'varchar', length: 50, default: 'manual' })
  data_source: string;

  // Operator can deprecate old indicators
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;
}
