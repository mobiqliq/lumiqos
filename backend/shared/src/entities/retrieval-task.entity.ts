import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum RetrievalTaskStatus {
  SCHEDULED = 'scheduled',
  DUE = 'due',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  OVERDUE = 'overdue',
}

export enum RetrievalTaskType {
  MICRO_QUIZ = 'micro_quiz',       // 3-5 questions, 2 min
  INTERLEAVED = 'interleaved',     // mixed topics
  EXIT_TICKET = 'exit_ticket',     // post-lesson
}

@Entity('retrieval_task')
@Index(['school_id', 'student_id', 'scheduled_date'])
@Index(['school_id', 'student_id', 'status'])
export class RetrievalTask extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  // Board topic this task covers
  @Column({ type: 'varchar', length: 255 })
  board_topic_id: string;

  // Question from question bank (nullable — AI can generate ad-hoc)
  @Column({ type: 'uuid', nullable: true })
  question_bank_id: string;

  @Column({ type: 'enum', enum: RetrievalTaskType, default: RetrievalTaskType.MICRO_QUIZ })
  task_type: RetrievalTaskType;

  @Column({ type: 'date' })
  scheduled_date: string;

  @Column({ type: 'date', nullable: true })
  due_date: string;

  @Column({ type: 'enum', enum: RetrievalTaskStatus, default: RetrievalTaskStatus.SCHEDULED })
  status: RetrievalTaskStatus;

  // SM-2 quality score 0-5 (0-1=blackout, 2=incorrect, 3=correct difficult, 4=correct, 5=perfect)
  @Column({ type: 'int', nullable: true })
  quality_score: number;

  // Student response
  @Column({ type: 'text', nullable: true })
  student_response: string;

  @Column({ type: 'boolean', nullable: true })
  is_correct: boolean;

  // Response time in milliseconds (fast correct = high confidence)
  @Column({ type: 'int', nullable: true })
  response_time_ms: number;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Forgetting curve id this task updated
  @Column({ type: 'uuid', nullable: true })
  forgetting_curve_id: string;

  // Sequence number for interleaved sets
  @Column({ type: 'int', default: 1 })
  sequence_in_set: number;
}
