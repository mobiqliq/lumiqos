import { Notification } from './notification.entity';
export declare class NotificationRecipient {
    id: string;
    notification_id: string;
    user_id: string;
    recipient_id: string;
    school_id: string;
    read_status: string;
    delivery_status: string;
    sent_at: Date;
    notification: Notification;
    created_at: Date;
}
