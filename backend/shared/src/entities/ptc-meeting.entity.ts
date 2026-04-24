import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum PTCMeetingStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

@Entity('ptc_meeting')
@Index(['school_id', 'teacher_user_id', 'scheduled_at'])
@Index(['school_id', 'parent_user_id', 'scheduled_at'])
@Index(['school_id', 'student_id'])
export class PTCMeeting extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  parent_user_id: string;

  @Column({ type: 'uuid' })
  teacher_user_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  academic_year_id: string;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ type: 'int', default: 15 })
  duration_minutes: number;

  @Column({ type: 'enum', enum: PTCMeetingStatus, default: PTCMeetingStatus.SCHEDULED })
  status: PTCMeetingStatus;

  // Pre-meeting AI brief for teacher
  // { strengths: [], concerns: [], ask_of_parent: string, generated_at: timestamp }
  @Column({ type: 'jsonb', nullable: true })
  teacher_brief: Record<string, any>;

  // Pre-meeting AI brief for parent
  // { achievements: [], discussion_points: [], generated_at: timestamp }
  @Column({ type: 'jsonb', nullable: true })
  parent_brief: Record<string, any>;

  // Digital agenda (shared during meeting)
  @Column({ type: 'jsonb', default: [] })
  agenda: Record<string, any>[];

  // During-meeting notes (teacher logs)
  @Column({ type: 'jsonb', default: [] })
  notes: Record<string, any>[];

  // Post-meeting summary
  @Column({ type: 'text', nullable: true })
  summary: string;

  // Rescheduled from
  @Column({ type: 'uuid', nullable: true })
  rescheduled_from_id: string;

  // Follow-up reminder sent
  @Column({ type: 'boolean', default: false })
  followup_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  followup_sent_at: Date;
}
