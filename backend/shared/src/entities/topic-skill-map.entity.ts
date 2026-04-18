import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SyllabusTopic } from './syllabus-topic.entity';
import { Skill } from './skill.entity';
import { LumiqosBaseEntity } from './base.entity';

@Entity('topic_skill_map')
@Index(['topic_id', 'skill_id'], { unique: true })
@Index(['school_id'])
export class TopicSkillMap extends LumiqosBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  topic_id: string;

  @Column({ type: 'uuid' })
  @Index()
  skill_id: string;

  @Column({ type: 'int', default: 1 })
  relevance_weight: number; // 1-10, how important this skill is for the topic

  @Column({ type: 'varchar', length: 50, nullable: true })
  skill_type: string; // 'prerequisite', 'core', 'extension'

  @ManyToOne(() => SyllabusTopic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: SyllabusTopic;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
