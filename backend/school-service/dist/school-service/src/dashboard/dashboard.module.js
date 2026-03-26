"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../../shared/src/entities/fee-payment.entity");
const notification_entity_1 = require("../../../shared/src/entities/notification.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                academic_year_entity_1.AcademicYear,
                student_entity_1.Student,
                student_enrollment_entity_1.StudentEnrollment,
                attendance_session_entity_1.AttendanceSession,
                student_attendance_entity_1.StudentAttendance,
                exam_entity_1.Exam,
                report_card_entity_1.ReportCard,
                class_entity_1.Class,
                homework_assignment_entity_1.HomeworkAssignment,
                homework_submission_entity_1.HomeworkSubmission,
                fee_invoice_entity_1.FeeInvoice,
                fee_payment_entity_1.FeePayment,
                notification_entity_1.Notification,
                message_thread_entity_1.MessageThread,
                notification_recipient_entity_1.NotificationRecipient
            ])
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
        exports: [dashboard_service_1.DashboardService]
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map