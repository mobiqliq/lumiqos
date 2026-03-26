import { Repository } from 'typeorm';
import { Notification } from '@lumiqos/shared/src/entities/notification.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { Message } from '@lumiqos/shared/src/entities/message.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
export declare class CommunicationService {
    private readonly notificationRepo;
    private readonly recipientRepo;
    private readonly threadRepo;
    private readonly messageRepo;
    private readonly enrollmentRepo;
    private readonly guardianRepo;
    private readonly teacherSubjectRepo;
    private readonly userRepo;
    constructor(notificationRepo: Repository<Notification>, recipientRepo: Repository<NotificationRecipient>, threadRepo: Repository<MessageThread>, messageRepo: Repository<Message>, enrollmentRepo: Repository<StudentEnrollment>, guardianRepo: Repository<StudentGuardian>, teacherSubjectRepo: Repository<TeacherSubject>, userRepo: Repository<User>);
    createNotification(dto: any, creatorId: string): Promise<Notification>;
    getNotifications(userId: string): Promise<NotificationRecipient[]>;
    markNotificationRead(notificationId: string, userId: string): Promise<{
        success: boolean;
    }>;
    createThread(studentId: string, teacherId: string, currentUser: any): Promise<MessageThread>;
    private validateThreadAccess;
    sendMessage(threadId: string, messageText: string, currentUser: any): Promise<Message>;
    getThreadMessages(threadId: string, currentUser: any): Promise<Message[]>;
    dispatchEventNotification(type: string, payload: any): Promise<void>;
}
