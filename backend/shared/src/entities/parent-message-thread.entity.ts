import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum ParentMessageThreadStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum ParentMessageThreadRecipientType {
  TEACHER = 'teacher',
  FRONT_DESK = 'front_desk',
  PRINCIPAL = 'principal',
}

@Entity('parent_message_thread')
@Index(['school_id', 'parent_user_id'])
@Index(['school_id', 'assigned_to_user_id'])
export class ParentMessageThread extends XceliQosBaseEntity {
  // Parent (guardian) initiating
  @Column({ type: 'uuid' })
  parent_user_id: string;

  // Student this thread concerns
  @Column({ type: 'uuid' })
  student_id: string;

  // Who the message is directed to
  @Column({ type: 'enum', enum: ParentMessageThreadRecipientType })
  recipient_type: ParentMessageThreadRecipientType;

  // Specific staff member assigned (nullable — front_desk may be unassigned)
  @Column({ type: 'uuid', nullable: true })
  assigned_to_user_id: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'enum', enum: ParentMessageThreadStatus, default: ParentMessageThreadStatus.OPEN })
  status: ParentMessageThreadStatus;

  // SLA: school configures response time in hours
  @Column({ type: 'int', nullable: true })
  sla_hours: number;

  @Column({ type: 'timestamp', nullable: true })
  sla_due_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  first_response_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  // Escalation: parent → principal (formal, acknowledged)
  @Column({ type: 'uuid', nullable: true })
  escalated_to_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  escalated_at: Date;
}
