import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ParentMessageSenderType {
  PARENT = 'parent',
  STAFF = 'staff',
}

@Entity('parent_message')
@Index(['school_id', 'thread_id', 'created_at'])
export class ParentMessage extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  thread_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'enum', enum: ParentMessageSenderType })
  sender_type: ParentMessageSenderType;

  @Column({ type: 'text' })
  content: string;

  // File attachment (in-platform only — no personal numbers ever shared)
  @Column({ type: 'varchar', length: 2048, nullable: true })
  attachment_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment_name: string;

  // XceliQ AI sentiment flag (conflict escalation early warning)
  @Column({ type: 'varchar', length: 50, nullable: true })
  sentiment: string; // positive | neutral | negative | flagged

  @Column({ type: 'boolean', default: false })
  is_sentiment_flagged: boolean;

  // Read tracking — staff side
  @Column({ type: 'timestamp', nullable: true })
  read_by_staff_at: Date;

  // Read tracking — parent side
  @Column({ type: 'timestamp', nullable: true })
  read_by_parent_at: Date;
}
