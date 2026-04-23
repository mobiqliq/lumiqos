import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('board_syllabus')
@Index(['board_id', 'grade', 'subject_id'], { unique: true })
export class BoardSyllabus extends XceliQosBaseEntity {
  // board_id: CBSE | ICSE | IB | IGCSE | STATE_MH | STATE_UP | STATE_KA | STATE_TN | STATE_RJ | STATE_GJ | NIOS
  @Column({ type: 'varchar', length: 50 })
  board_id: string;

  // Grade level: 1-12
  @Column({ type: 'int' })
  grade: number;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'varchar', length: 255 })
  subject_name: string;

  // Academic year pattern this syllabus applies to e.g. "2024-25"
  @Column({ type: 'varchar', length: 20, nullable: true })
  academic_year_pattern: string;

  // Canonical topic list — operator managed
  // [{
  //   topic_id: string,
  //   topic_name: string,
  //   subtopics: string[],
  //   bloom_expectations: { remember: 10, understand: 20, apply: 30, analyze: 20, evaluate: 10, create: 10 },
  //   nep_competency: string | null,
  //   estimated_periods: number,
  //   sequence_order: number
  // }]
  @Column({ type: 'jsonb' })
  topics: Record<string, any>[];

  @Column({ type: 'int', default: 0 })
  total_topics: number;

  @Column({ type: 'int', default: 0 })
  total_estimated_periods: number;

  // Operator can mark as deprecated when board updates curriculum
  @Column({ type: 'boolean', default: true })
  is_current: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  version: string;
}
