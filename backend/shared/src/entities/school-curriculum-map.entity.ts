import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('school_curriculum_map')
@Index(['school_id', 'subject_id', 'class_id', 'academic_year_id'])
@Index(['school_id', 'subject_id', 'class_id', 'is_active'])
export class SchoolCurriculumMap extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @Column({ type: 'uuid' })
  board_syllabus_id: string;

  // Board id denormalized for fast filtering
  @Column({ type: 'varchar', length: 50 })
  board_id: string;

  // Textbook details — school declares per academic year
  @Column({ type: 'varchar', length: 255 })
  textbook_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  textbook_author: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  textbook_publisher: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  textbook_edition: string;

  @Column({ type: 'int', default: 0 })
  total_chapters: number;

  // Chapter → board topic mapping
  // [{
  //   chapter_number: 1,
  //   chapter_name: "Real Numbers",
  //   board_topic_ids: ["topic_uuid_1", "topic_uuid_2"],
  //   estimated_periods: 8,
  //   sequence_order: 1,
  //   is_taught: false,
  //   taught_date: null
  // }]
  @Column({ type: 'jsonb', default: [] })
  chapter_mappings: Record<string, any>[];

  // Coverage stats (computed and cached)
  @Column({ type: 'int', default: 0 })
  mapped_topics_count: number;

  @Column({ type: 'int', default: 0 })
  total_board_topics: number;

  // Only one active map per school+subject+class at any time
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Set when superseded by new map — never deleted
  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date;

  @Column({ type: 'uuid', nullable: true })
  archived_by: string;

  // If restored from a previous map, track source
  @Column({ type: 'uuid', nullable: true })
  restored_from_map_id: string;
}
