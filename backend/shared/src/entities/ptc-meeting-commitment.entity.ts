import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum CommitmentOwner {
  PARENT = 'parent',
  TEACHER = 'teacher',
  SCHOOL = 'school',
}

export enum CommitmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

@Entity('ptc_meeting_commitment')
@Index(['school_id', 'meeting_id'])
@Index(['school_id', 'owner_user_id', 'status'])
export class PTCMeetingCommitment extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  meeting_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'text' })
  commitment_text: string;

  @Column({ type: 'enum', enum: CommitmentOwner })
  owner: CommitmentOwner;

  @Column({ type: 'uuid' })
  owner_user_id: string;

  @Column({ type: 'enum', enum: CommitmentStatus, default: CommitmentStatus.PENDING })
  status: CommitmentStatus;

  @Column({ type: 'date', nullable: true })
  due_date: string;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'text', nullable: true })
  completion_notes: string;

  // Reminder sent flag
  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;
}
