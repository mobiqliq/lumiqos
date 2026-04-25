import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ChatChannelType {
  CLASS = 'class',
  SUBJECT = 'subject',
  DEPARTMENT = 'department',
  WHOLE_SCHOOL = 'whole_school',
  DIRECT = 'direct',
  ALUMNI = 'alumni',
  GROUP = 'group',
}

@Entity('chat_channel')
@Index(['school_id', 'type'])
export class ChatChannel extends XceliQosBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ChatChannelType })
  type: ChatChannelType;

  // For class/subject channels — optional scope refs
  @Column({ type: 'uuid', nullable: true })
  class_id: string;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  // For GROUP/ALUMNI channel types — scoped to SchoolGroup
  @Column({ type: 'uuid', nullable: true })
  group_id: string;

  // Principal announcements require acknowledgment
  @Column({ type: 'boolean', default: false })
  requires_acknowledgment: boolean;

  // Soft archive
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
