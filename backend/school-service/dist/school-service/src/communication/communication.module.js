"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notifications_controller_1 = require("./notifications.controller");
const messages_controller_1 = require("./messages.controller");
const communication_service_1 = require("./communication.service");
const notification_entity_1 = require("../../../shared/src/entities/notification.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const message_entity_1 = require("../../../shared/src/entities/message.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                notification_entity_1.Notification,
                notification_recipient_entity_1.NotificationRecipient,
                message_thread_entity_1.MessageThread,
                message_entity_1.Message,
                student_enrollment_entity_1.StudentEnrollment,
                student_guardian_entity_1.StudentGuardian,
                teacher_subject_entity_1.TeacherSubject,
                user_entity_1.User
            ])
        ],
        controllers: [notifications_controller_1.NotificationsController, messages_controller_1.MessagesController],
        providers: [communication_service_1.CommunicationService],
        exports: [communication_service_1.CommunicationService]
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map