"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const teacher_controller_1 = require("./teacher.controller");
const teacher_service_1 = require("./teacher.service");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const message_entity_1 = require("../../../shared/src/entities/message.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
let TeacherModule = class TeacherModule {
};
exports.TeacherModule = TeacherModule;
exports.TeacherModule = TeacherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                teacher_subject_entity_1.TeacherSubject,
                homework_assignment_entity_1.HomeworkAssignment,
                homework_submission_entity_1.HomeworkSubmission,
                message_thread_entity_1.MessageThread,
                message_entity_1.Message,
                attendance_session_entity_1.AttendanceSession,
                student_attendance_entity_1.StudentAttendance,
                student_enrollment_entity_1.StudentEnrollment,
                academic_year_entity_1.AcademicYear,
                user_entity_1.User
            ])
        ],
        controllers: [teacher_controller_1.TeacherController],
        providers: [teacher_service_1.TeacherService],
        exports: [teacher_service_1.TeacherService]
    })
], TeacherModule);
//# sourceMappingURL=teacher.module.js.map