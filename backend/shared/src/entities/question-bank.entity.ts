import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum QuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCH = 'match',
  SHORT_ANSWER = 'short_answer',
  SUBJECTIVE = 'subjective',
}

export enum BloomLevel {
  REMEMBER = 'remember',
  UNDERSTAND = 'understand',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('question_bank')
@Index(['school_id', 'subject_id', 'bloom_level'])
@Index(['school_id', 'subject_id', 'difficulty'])
export class QuestionBank extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'uuid', nullable: true })
  class_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  topic: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nep_competency: string;

  @Column({ type: 'enum', enum: QuestionType })
  question_type: QuestionType;

  @Column({ type: 'enum', enum: BloomLevel })
  bloom_level: BloomLevel;

  @Column({ type: 'enum', enum: DifficultyLevel })
  difficulty: DifficultyLevel;

  @Column({ type: 'text' })
  question_text: string;

  // MCQ options: [{ id: 'A', text: '...' }, ...]
  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any>[];

  // Correct answer: 'A' for MCQ, 'True' for T/F, text for fill-in
  @Column({ type: 'text', nullable: true })
  correct_answer: string;

  // For match questions: [{ left: '...', right: '...' }]
  @Column({ type: 'jsonb', nullable: true })
  match_pairs: Record<string, any>[];

  // Rubric for subjective marking
  @Column({ type: 'jsonb', nullable: true })
  rubric: Record<string, any>;

  @Column({ type: 'float', default: 1 })
  default_marks: number;

  // Estimated time in minutes
  @Column({ type: 'int', default: 2 })
  estimated_minutes: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  // Times used in exams
  @Column({ type: 'int', default: 0 })
  usage_count: number;
}
