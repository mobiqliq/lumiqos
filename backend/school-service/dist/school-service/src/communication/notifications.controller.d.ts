import { CommunicationService } from './communication.service';
export declare class NotificationsController {
    private readonly communicationService;
    constructor(communicationService: CommunicationService);
    createNotification(dto: {
        title: string;
        message: string;
        type: string;
        target_class_id?: string;
        target_section_id?: string;
    }, user: any): Promise<import("@lumiqos/shared/index").Notification>;
    getNotifications(user: any): Promise<import("@lumiqos/shared/index").NotificationRecipient[]>;
    markNotificationRead(dto: {
        notification_id: string;
    }, user: any): Promise<{
        success: boolean;
    }>;
}
