import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('chat_message')
@Index(['school_id', 'channel_id', 'created_at'])
export class ChatMessage extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  channel_id: string;

  @Column({ type: 'uuid' })
  sender_id: string;

  @Column({ type: 'text' })
  content: string;

  // Threading: reply to another message
  @Column({ type: 'uuid', nullable: true })
  parent_message_id: string;

  // File/document sharing
  @Column({ type: 'varchar', length: 2048, nullable: true })
  attachment_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachment_name: string;

  // @XceliQ AI responses flagged separately
  @Column({ type: 'boolean', default: false })
  is_ai_response: boolean;

  // Poll reference — if this message contains a poll
  @Column({ type: 'uuid', nullable: true })
  poll_id: string;

  // Soft edit tracking
  @Column({ type: 'boolean', default: false })
  is_edited: boolean;
}
