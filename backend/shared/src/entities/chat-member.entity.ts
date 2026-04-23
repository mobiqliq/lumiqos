import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ChatMemberStatus {
  ACTIVE = 'active',
  MUTED = 'muted',
  IN_CLASS = 'in_class',
}

export enum ChatMemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

@Entity('chat_member')
@Index(['school_id', 'channel_id', 'user_id'], { unique: true })
export class ChatMember extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  channel_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: ChatMemberRole, default: ChatMemberRole.MEMBER })
  role: ChatMemberRole;

  @Column({ type: 'enum', enum: ChatMemberStatus, default: ChatMemberStatus.ACTIVE })
  status: ChatMemberStatus;

  // For acknowledgment tracking on principal announcements
  @Column({ type: 'boolean', default: false })
  has_acknowledged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acknowledged_at: Date;

  // Unread tracking
  @Column({ type: 'timestamp', nullable: true })
  last_read_at: Date;
}
