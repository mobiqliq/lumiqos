import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('broadcast_read_receipt')
@Index(['school_id', 'announcement_id', 'user_id'], { unique: true })
export class BroadcastReadReceipt extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  announcement_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'timestamp' })
  read_at: Date;
}
