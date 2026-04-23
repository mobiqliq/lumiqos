import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum BroadcastTriggerType {
  MANUAL = 'manual',
  FEE_OVERDUE = 'fee_overdue',
  ATTENDANCE_ALERT = 'attendance_alert',
  EXAM_REMINDER = 'exam_reminder',
  GENERAL = 'general',
}

export enum BroadcastAudienceType {
  ALL_PARENTS = 'all_parents',
  CLASS_PARENTS = 'class_parents',
  SECTION_PARENTS = 'section_parents',
  ALL_STAFF = 'all_staff',
  WHOLE_SCHOOL = 'whole_school',
}

@Entity('broadcast_announcement')
@Index(['school_id', 'created_at'])
export class BroadcastAnnouncement extends XceliQosBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: BroadcastTriggerType, default: BroadcastTriggerType.MANUAL })
  trigger_type: BroadcastTriggerType;

  @Column({ type: 'enum', enum: BroadcastAudienceType })
  audience_type: BroadcastAudienceType;

  // Optional scope for class/section targeted broadcasts
  @Column({ type: 'uuid', nullable: true })
  target_class_id: string;

  @Column({ type: 'uuid', nullable: true })
  target_section_id: string;

  // 7-year audit archive compliance
  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  // XceliQ AI sentiment flag
  @Column({ type: 'boolean', default: false })
  is_sentiment_flagged: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sentiment: string;

  // Total recipients count (set at send time)
  @Column({ type: 'int', default: 0 })
  recipient_count: number;

  // Read receipt count (incremented on read)
  @Column({ type: 'int', default: 0 })
  read_count: number;
}
