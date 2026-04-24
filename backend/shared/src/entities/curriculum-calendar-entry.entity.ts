import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum CalendarEntryStatus {
  PLANNED = 'planned',
  TAUGHT = 'taught',
  MISSED = 'missed',
  SUBSTITUTED = 'substituted',
  HOLIDAY = 'holiday',
  EXAM = 'exam',
  RESCHEDULED = 'rescheduled',
}

@Entity('curriculum_calendar_entry')
@Index(['school_id', 'curriculum_calendar_id', 'planned_date'])
@Index(['school_id', 'class_id', 'subject_id', 'planned_date'])
export class CurriculumCalendarEntry extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  curriculum_calendar_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'uuid' })
  class_id: string;

  @Column({ type: 'uuid' })
  subject_id: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'uuid', nullable: true })
  timetable_period_id: string;

  // Day of week (0=Sun...6=Sat) — timezone-aware generation
  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'date' })
  planned_date: string;

  @Column({ type: 'date', nullable: true })
  actual_date: string;

  // Chapter from SchoolCurriculumMap
  @Column({ type: 'int', nullable: true })
  chapter_number: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  chapter_name: string;

  // Board topic IDs covered in this period
  @Column({ type: 'jsonb', default: [] })
  board_topic_ids: string[];

  // Lesson objective for this period (teacher can fill)
  @Column({ type: 'text', nullable: true })
  lesson_objective: string;

  @Column({ type: 'enum', enum: CalendarEntryStatus, default: CalendarEntryStatus.PLANNED })
  status: CalendarEntryStatus;

  // Substitution tracking
  @Column({ type: 'boolean', default: false })
  is_substituted: boolean;

  @Column({ type: 'uuid', nullable: true })
  substitute_teacher_id: string;

  // If rescheduled, link to new entry
  @Column({ type: 'uuid', nullable: true })
  rescheduled_to_entry_id: string;

  // Teacher marks taught: timestamp + notes
  @Column({ type: 'timestamp', nullable: true })
  marked_taught_at: Date;

  @Column({ type: 'text', nullable: true })
  taught_notes: string;

  // Sequence index within subject for ordered coverage tracking
  @Column({ type: 'int', default: 0 })
  sequence_index: number;

  // Rebalance metadata: which scenario placed this entry
  @Column({ type: 'varchar', length: 50, nullable: true })
  rebalance_scenario: string;
}
