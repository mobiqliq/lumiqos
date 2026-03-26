import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Notification } from './notification.entity';

@Entity()
export class NotificationRecipient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    notification_id: string;

    @Column({ type: 'varchar', nullable: true })
    user_id: string;

    @Column({ type: 'varchar', nullable: true })
    recipient_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string; // Added school_id

    @Column({ type: 'varchar', nullable: true })
    read_status: string;

    @Column({ type: 'varchar', nullable: true })
    delivery_status: string; // Added delivery_status

    @Column({ type: 'timestamp', nullable: true })
    sent_at: Date;

    @ManyToOne(() => Notification)
    @JoinColumn({ name: 'notification_id' })
    notification: Notification;

    @CreateDateColumn()
    created_at: Date;
}
