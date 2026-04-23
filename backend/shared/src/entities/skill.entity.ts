import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('skill')
@Index(['school_id'])
@Index(['subject_id'])
@Index(['name'])
export class Skill extends XceliQosBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // 'numeracy', 'literacy', 'cognitive', 'social'

  @Column({ type: 'int', nullable: true })
  difficulty_level: number; // 1-10

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: string[]; // Array of skill IDs

  @Column({ type: 'jsonb', nullable: true })
  taxonomy: Record<string, any>; // Bloom's taxonomy, etc.
}
