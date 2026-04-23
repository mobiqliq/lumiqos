import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('exam_question')
@Index(['school_id', 'exam_subject_id'])
export class ExamQuestion extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  exam_subject_id: string;

  @Column({ type: 'uuid' })
  question_bank_id: string;

  // Order on the answer sheet
  @Column({ type: 'int', default: 1 })
  question_order: number;

  // Section label: A, B, C or custom
  @Column({ type: 'varchar', length: 50, nullable: true })
  section_label: string;

  // Marks allocated for this question in this exam (may differ from default_marks)
  @Column({ type: 'float' })
  allocated_marks: number;

  // Override options for this exam instance (nullable — uses question_bank options if null)
  @Column({ type: 'jsonb', nullable: true })
  options_override: Record<string, any>[];

  // Answer sheet zone coords (set during PDF generation)
  // { page: 1, x: 120, y: 340, width: 200, height: 40 }
  @Column({ type: 'jsonb', nullable: true })
  sheet_zone: Record<string, any>;

  // Marks box zone coords on answer sheet
  @Column({ type: 'jsonb', nullable: true })
  marks_box_zone: Record<string, any>;
}
