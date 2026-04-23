import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum SheetProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  EXTRACTED = 'extracted',
  TEACHER_REVIEW = 'teacher_review',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity('student_answer_sheet')
@Index(['school_id', 'exam_subject_id', 'student_id'], { unique: true })
export class StudentAnswerSheet extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  exam_subject_id: string;

  @Column({ type: 'uuid' })
  exam_answer_sheet_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  // Uploaded photo URL
  @Column({ type: 'varchar', length: 2048, nullable: true })
  image_url: string;

  @Column({ type: 'timestamp', nullable: true })
  uploaded_at: Date;

  // QR decode result
  @Column({ type: 'jsonb', nullable: true })
  qr_decoded: Record<string, any>;

  // AI extraction result per question
  // [{
  //   exam_question_id: uuid,
  //   question_order: 1,
  //   question_type: 'mcq',
  //   extracted_answer: 'B',
  //   extracted_marks: 2,
  //   confidence: 0.95,
  //   confidence_level: 'high' | 'medium' | 'low',
  //   needs_review: false
  // }]
  @Column({ type: 'jsonb', nullable: true })
  extraction_result: Record<string, any>[];

  // Per-field confidence map
  @Column({ type: 'jsonb', nullable: true })
  confidence_map: Record<string, any>;

  // Overall image quality score
  @Column({ type: 'float', nullable: true })
  image_quality_score: number;

  // Cross-validation result
  // { marks_sum_matches_total: bool, flagged_questions: [] }
  @Column({ type: 'jsonb', nullable: true })
  validation_result: Record<string, any>;

  @Column({ type: 'enum', enum: SheetProcessingStatus, default: SheetProcessingStatus.PENDING })
  processing_status: SheetProcessingStatus;

  // Teacher confirmed marks (finalized)
  // { question_order: marks, ... }
  @Column({ type: 'jsonb', nullable: true })
  confirmed_marks: Record<string, any>;

  @Column({ type: 'float', nullable: true })
  total_marks_confirmed: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  grade_confirmed: string;

  @Column({ type: 'boolean', default: false })
  teacher_confirmed: boolean;

  @Column({ type: 'uuid', nullable: true })
  confirmed_by: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date;

  // Notification sent to student + parent after confirmation
  @Column({ type: 'boolean', default: false })
  result_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  result_notified_at: Date;
}
