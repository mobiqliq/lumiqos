import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum AnswerSheetStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('exam_answer_sheet')
@Index(['school_id', 'exam_subject_id'], { unique: true })
export class ExamAnswerSheet extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  exam_subject_id: string;

  @Column({ type: 'uuid' })
  exam_id: string;

  // QR payload config: encodes exam_id + subject_id + class_id
  @Column({ type: 'jsonb' })
  qr_payload: Record<string, any>;

  // Section config — drives PDF generation
  // [{
  //   section_label: 'A',
  //   section_title: 'Multiple Choice Questions',
  //   question_type: 'mcq',
  //   instructions: string,
  //   questions: [exam_question_ids]
  // }]
  @Column({ type: 'jsonb', default: [] })
  sections: Record<string, any>[];

  // PDF template settings
  @Column({ type: 'jsonb', nullable: true })
  template_config: Record<string, any>;
  // {
  //   paper_size: 'A4',
  //   font_size: 11,
  //   marks_box_width: 40,
  //   marks_box_height: 20,
  //   bubble_diameter: 12,
  //   header_logo: true,
  //   board_name_in_header: true,
  //   summary_strip: true
  // }

  // Generated PDF URL (stored after generation)
  @Column({ type: 'varchar', length: 2048, nullable: true })
  pdf_url: string;

  @Column({ type: 'timestamp', nullable: true })
  pdf_generated_at: Date;

  @Column({ type: 'enum', enum: AnswerSheetStatus, default: AnswerSheetStatus.DRAFT })
  status: AnswerSheetStatus;
}
