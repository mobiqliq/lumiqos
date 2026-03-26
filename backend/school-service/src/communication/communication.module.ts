import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { MessagesController } from './messages.controller';
import { CommunicationService } from './communication.service';
import { Notification } from '@lumiqos/shared/src/entities/notification.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { Message } from '@lumiqos/shared/src/entities/message.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Notification,
            NotificationRecipient,
            MessageThread,
            Message,
            StudentEnrollment,
            StudentGuardian,
            TeacherSubject,
            User
        ])
    ],
    controllers: [NotificationsController, MessagesController],
    providers: [CommunicationService],
    exports: [CommunicationService]
})
export class CommunicationModule { }
