import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum AssistantPersona {
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student',
  FINANCE = 'finance',
  HR = 'hr',
  FRONT_DESK = 'front_desk',
  COUNSELOR = 'counselor',
}

@Entity('assistant_interaction')
@Index(['school_id', 'user_id', 'created_at'])
@Index(['school_id', 'persona'])
export class AssistantInteraction extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: AssistantPersona })
  persona: AssistantPersona;

  // User query
  @Column({ type: 'text' })
  query: string;

  // Context injected (sans sensitive data)
  @Column({ type: 'jsonb', nullable: true })
  context_summary: Record<string, any>;

  // Assistant response
  @Column({ type: 'text' })
  response: string;

  // Token usage
  @Column({ type: 'int', nullable: true })
  input_tokens: number;

  @Column({ type: 'int', nullable: true })
  output_tokens: number;

  // Model used
  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  // Response time in ms
  @Column({ type: 'int', nullable: true })
  response_time_ms: number;

  // Draft flag — AI outputs are drafts, never autonomous actions
  @Column({ type: 'boolean', default: true })
  is_draft: boolean;

  // User rated helpfulness (1-5, optional)
  @Column({ type: 'int', nullable: true })
  helpfulness_rating: number;
}
