import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('item_analysis')
@Index(['school_id', 'exam_subject_id', 'question_bank_id'], { unique: true })
export class ItemAnalysis extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  exam_subject_id: string;

  @Column({ type: 'uuid' })
  exam_question_id: string;

  @Column({ type: 'uuid' })
  question_bank_id: string;

  // Total students who attempted this question
  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  // Difficulty index: proportion who got it correct (0-1)
  // < 0.3 = hard, 0.3-0.7 = medium, > 0.7 = easy
  @Column({ type: 'float', nullable: true })
  difficulty_index: number;

  // Discrimination index: correlation between question score and total score (-1 to 1)
  // > 0.3 = good discriminator, 0.1-0.3 = marginal, < 0.1 = poor
  @Column({ type: 'float', nullable: true })
  discrimination_index: number;

  // For MCQ: option-wise response distribution
  // { A: 12, B: 3, C: 8, D: 2 }
  @Column({ type: 'jsonb', nullable: true })
  option_distribution: Record<string, any>;

  // Average marks obtained on this question
  @Column({ type: 'float', nullable: true })
  average_marks: number;

  // Max marks for this question in this exam
  @Column({ type: 'float', nullable: true })
  max_marks: number;

  // AI-generated insight on this question
  @Column({ type: 'text', nullable: true })
  ai_insight: string;

  // Flag for poor items (discrimination < 0.1 or difficulty < 0.2)
  @Column({ type: 'boolean', default: false })
  is_flagged: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  flag_reason: string;
}
