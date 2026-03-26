"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const role_entity_1 = require("../../../shared/src/entities/role.entity");
const permission_entity_1 = require("../../../shared/src/entities/permission.entity");
const role_permission_entity_1 = require("../../../shared/src/entities/role-permission.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const student_document_entity_1 = require("../../../shared/src/entities/student-document.entity");
const student_health_record_entity_1 = require("../../../shared/src/entities/student-health-record.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
const exam_type_entity_1 = require("../../../shared/src/entities/exam-type.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const exam_subject_entity_1 = require("../../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../../shared/src/entities/student-marks.entity");
const grade_scale_entity_1 = require("../../../shared/src/entities/grade-scale.entity");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const report_card_subject_entity_1 = require("../../../shared/src/entities/report-card-subject.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const curriculum_mapping_entity_1 = require("../../../shared/src/entities/curriculum-mapping.entity");
const curriculum_plan_entity_1 = require("../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
const teaching_log_entity_1 = require("../../../shared/src/entities/teaching-log.entity");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
const academic_plan_entity_1 = require("../../../shared/src/entities/academic-plan.entity");
const academic_plan_item_entity_1 = require("../../../shared/src/entities/academic-plan-item.entity");
const planning_calendar_entity_1 = require("../../../shared/src/entities/planning-calendar.entity");
const planning_day_entity_1 = require("../../../shared/src/entities/planning-day.entity");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'lumiq',
    synchronize: false,
    logging: true,
    entities: [
        user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, role_permission_entity_1.RolePermission, school_entity_1.School, academic_year_entity_1.AcademicYear, class_entity_1.Class, section_entity_1.Section, subject_entity_1.Subject, teacher_subject_entity_1.TeacherSubject,
        student_entity_1.Student, student_enrollment_entity_1.StudentEnrollment, student_guardian_entity_1.StudentGuardian, student_document_entity_1.StudentDocument, student_health_record_entity_1.StudentHealthRecord,
        attendance_session_entity_1.AttendanceSession, student_attendance_entity_1.StudentAttendance, homework_assignment_entity_1.HomeworkAssignment, homework_submission_entity_1.HomeworkSubmission,
        exam_type_entity_1.ExamType, exam_entity_1.Exam, exam_subject_entity_1.ExamSubject, student_marks_entity_1.StudentMarks, grade_scale_entity_1.GradeScale, report_card_entity_1.ReportCard, report_card_subject_entity_1.ReportCardSubject,
        syllabus_entity_1.Syllabus, curriculum_mapping_entity_1.CurriculumMapping, fee_invoice_entity_1.FeeInvoice, curriculum_plan_entity_1.CurriculumPlan, curriculum_plan_item_entity_1.CurriculumPlanItem, teaching_log_entity_1.TeachingLog,
        board_entity_1.Board, academic_plan_entity_1.AcademicPlan, academic_plan_item_entity_1.AcademicPlanItem, planning_calendar_entity_1.PlanningCalendar, planning_day_entity_1.PlanningDay
    ],
    migrations: ['src/migrations/*.ts'],
});
//# sourceMappingURL=data-source.js.map