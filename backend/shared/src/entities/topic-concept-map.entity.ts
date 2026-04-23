import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SyllabusTopic } from './syllabus-topic.entity';
import { Concept } from './concept.entity';
import { XceliQosBaseEntity } from './base.entity';

@Entity('topic_concept_map')
@Index(['topic_id', 'concept_id'], { unique: true })
@Index(['school_id'])
export class TopicConceptMap extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  topic_id: string;

  @Column({ type: 'uuid' })
  @Index()
  concept_id: string;

  @Column({ type: 'int', default: 1 })
  relevance_weight: number; // 1-10

  @Column({ type: 'boolean', default: false })
  is_core_concept: boolean;

  @ManyToOne(() => SyllabusTopic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: SyllabusTopic;

  @ManyToOne(() => Concept, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'concept_id' })
  concept: Concept;
}
