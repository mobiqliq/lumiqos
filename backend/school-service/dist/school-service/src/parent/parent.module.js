"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const parent_controller_1 = require("./parent.controller");
const parent_service_1 = require("./parent.service");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
let ParentModule = class ParentModule {
};
exports.ParentModule = ParentModule;
exports.ParentModule = ParentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                student_guardian_entity_1.StudentGuardian,
                student_entity_1.Student,
                student_enrollment_entity_1.StudentEnrollment,
                student_attendance_entity_1.StudentAttendance,
                homework_assignment_entity_1.HomeworkAssignment,
                homework_submission_entity_1.HomeworkSubmission,
                report_card_entity_1.ReportCard,
                fee_invoice_entity_1.FeeInvoice,
                fee_payment_entity_1.FeePayment,
                notification_recipient_entity_1.NotificationRecipient,
                message_thread_entity_1.MessageThread,
                academic_year_entity_1.AcademicYear
            ])
        ],
        controllers: [parent_controller_1.ParentController],
        providers: [parent_service_1.ParentService],
        exports: [parent_service_1.ParentService]
    })
], ParentModule);
//# sourceMappingURL=parent.module.js.map