import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('homework_feedback')
@Index(['school_id', 'submission_id'], { unique: true })
export class HomeworkFeedback extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  submission_id: string;

  @Column({ type: 'uuid' })
  homework_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  // Growth Mindset structured feedback triad
  @Column({ type: 'text', nullable: true })
  strength: string;

  @Column({ type: 'text', nullable: true })
  improvement: string;

  @Column({ type: 'text', nullable: true })
  encouragement: string;

  // AI pre-grading draft (teacher reviews before confirming)
  @Column({ type: 'jsonb', nullable: true })
  ai_draft: Record<string, any>;

  // Teacher has confirmed/overridden AI draft
  @Column({ type: 'boolean', default: false })
  teacher_confirmed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  teacher_confirmed_at: Date;

  // Grade (free text — A/B/C or numeric or rubric label)
  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string;

  // Late submission flag (set at submit time)
  @Column({ type: 'boolean', default: false })
  is_late: boolean;

  // Parent visibility
  @Column({ type: 'boolean', default: true })
  parent_visible: boolean;

  // "Tell your parents" button — parent notification triggered
  @Column({ type: 'boolean', default: false })
  parent_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  parent_notified_at: Date;
}
