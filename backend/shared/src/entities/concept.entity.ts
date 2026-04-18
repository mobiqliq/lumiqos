import { Entity, Column, Index } from 'typeorm';
import { LumiqosBaseEntity } from './base.entity';

@Entity('concept')
@Index(['school_id'])
@Index(['subject_id'])
@Index(['name'])
export class Concept extends LumiqosBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  domain: string; // 'mathematics', 'language', 'science', 'social_studies'

  @Column({ type: 'int', nullable: true })
  grade_level: number;

  @Column({ type: 'jsonb', nullable: true })
  related_concepts: string[]; // Array of concept IDs

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[];

  @Column({ type: 'jsonb', nullable: true })
  learning_objectives: string[];
}
