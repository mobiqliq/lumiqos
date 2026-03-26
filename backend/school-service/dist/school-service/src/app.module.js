"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const school_module_1 = require("./schools/school.module");
const students_module_1 = require("./students/students.module");
const attendance_module_1 = require("./attendance/attendance.module");
const homework_module_1 = require("./homework/homework.module");
const exams_module_1 = require("./exams/exams.module");
const report_cards_module_1 = require("./report-cards/report-cards.module");
const communication_module_1 = require("./communication/communication.module");
const finance_module_1 = require("./finance/finance.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const teacher_module_1 = require("./teacher/teacher.module");
const parent_module_1 = require("./parent/parent.module");
const user_entity_1 = require("../../shared/src/entities/user.entity");
const role_entity_1 = require("../../shared/src/entities/role.entity");
const permission_entity_1 = require("../../shared/src/entities/permission.entity");
const role_permission_entity_1 = require("../../shared/src/entities/role-permission.entity");
const school_entity_1 = require("../../shared/src/entities/school.entity");
const academic_year_entity_1 = require("../../shared/src/entities/academic-year.entity");
const class_entity_1 = require("../../shared/src/entities/class.entity");
const section_entity_1 = require("../../shared/src/entities/section.entity");
const subject_entity_1 = require("../../shared/src/entities/subject.entity");
const teacher_subject_entity_1 = require("../../shared/src/entities/teacher-subject.entity");
const student_entity_1 = require("../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../shared/src/entities/student-guardian.entity");
const student_document_entity_1 = require("../../shared/src/entities/student-document.entity");
const student_health_record_entity_1 = require("../../shared/src/entities/student-health-record.entity");
const attendance_session_entity_1 = require("../../shared/src/entities/attendance-session.entity");
const student_attendance_entity_1 = require("../../shared/src/entities/student-attendance.entity");
const homework_assignment_entity_1 = require("../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../shared/src/entities/homework-submission.entity");
const exam_type_entity_1 = require("../../shared/src/entities/exam-type.entity");
const exam_entity_1 = require("../../shared/src/entities/exam.entity");
const exam_subject_entity_1 = require("../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../shared/src/entities/student-marks.entity");
const grade_scale_entity_1 = require("../../shared/src/entities/grade-scale.entity");
const report_card_entity_1 = require("../../shared/src/entities/report-card.entity");
const report_card_subject_entity_1 = require("../../shared/src/entities/report-card-subject.entity");
const lesson_plan_entity_1 = require("../../shared/src/entities/lesson-plan.entity");
const fee_invoice_entity_1 = require("../../shared/src/entities/fee-invoice.entity");
const fee_payment_entity_1 = require("../../shared/src/entities/fee-payment.entity");
const syllabus_entity_1 = require("../../shared/src/entities/syllabus.entity");
const syllabus_topic_entity_1 = require("../../shared/src/entities/syllabus-topic.entity");
const curriculum_mapping_entity_1 = require("../../shared/src/entities/curriculum-mapping.entity");
const curriculum_plan_entity_1 = require("../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../shared/src/entities/curriculum-plan-item.entity");
const teaching_log_entity_1 = require("../../shared/src/entities/teaching-log.entity");
const board_entity_1 = require("../../shared/src/entities/board.entity");
const academic_plan_entity_1 = require("../../shared/src/entities/academic-plan.entity");
const academic_plan_item_entity_1 = require("../../shared/src/entities/academic-plan-item.entity");
const planning_calendar_entity_1 = require("../../shared/src/entities/planning-calendar.entity");
const curriculum_unit_entity_1 = require("../../shared/src/entities/curriculum-unit.entity");
const school_calendar_entity_1 = require("../../shared/src/entities/school-calendar.entity");
const time_slot_entity_1 = require("../../shared/src/entities/time-slot.entity");
const planned_schedule_entity_1 = require("../../shared/src/entities/planned-schedule.entity");
const curriculum_module_1 = require("./curriculum/curriculum.module");
const curriculum_orchestrator_module_1 = require("./curriculum-orchestrator/curriculum-orchestrator.module");
const academic_planning_module_1 = require("./academic-planning/academic-planning.module");
const ai_module_1 = require("./ai/ai.module");
const timetable_module_1 = require("./timetable/timetable.module");
const substitution_module_1 = require("./substitution/substitution.module");
const seeder_service_1 = require("./database/seeder.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'lumiqos_db',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'lumiq',
                autoLoadEntities: true,
                synchronize: true,
                logging: true,
                entities: [
                    user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, role_permission_entity_1.RolePermission, school_entity_1.School, academic_year_entity_1.AcademicYear, class_entity_1.Class, section_entity_1.Section, subject_entity_1.Subject, teacher_subject_entity_1.TeacherSubject,
                    student_entity_1.Student, student_enrollment_entity_1.StudentEnrollment, student_guardian_entity_1.StudentGuardian, student_document_entity_1.StudentDocument, student_health_record_entity_1.StudentHealthRecord,
                    attendance_session_entity_1.AttendanceSession, student_attendance_entity_1.StudentAttendance, homework_assignment_entity_1.HomeworkAssignment, homework_submission_entity_1.HomeworkSubmission,
                    exam_type_entity_1.ExamType, exam_entity_1.Exam, exam_subject_entity_1.ExamSubject, student_marks_entity_1.StudentMarks, grade_scale_entity_1.GradeScale, report_card_entity_1.ReportCard, report_card_subject_entity_1.ReportCardSubject,
                    syllabus_entity_1.Syllabus, syllabus_topic_entity_1.SyllabusTopic, curriculum_mapping_entity_1.CurriculumMapping, fee_invoice_entity_1.FeeInvoice, fee_payment_entity_1.FeePayment, curriculum_plan_entity_1.CurriculumPlan, curriculum_plan_item_entity_1.CurriculumPlanItem, teaching_log_entity_1.TeachingLog,
                    board_entity_1.Board, academic_plan_entity_1.AcademicPlan, academic_plan_item_entity_1.AcademicPlanItem, planning_calendar_entity_1.PlanningCalendar,
                    curriculum_unit_entity_1.CurriculumUnit, school_calendar_entity_1.SchoolCalendar, time_slot_entity_1.TimeSlot, planned_schedule_entity_1.PlannedSchedule, lesson_plan_entity_1.LessonPlan
                ],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                school_entity_1.School, student_entity_1.Student, academic_year_entity_1.AcademicYear, class_entity_1.Class, section_entity_1.Section, student_enrollment_entity_1.StudentEnrollment,
                user_entity_1.User, attendance_session_entity_1.AttendanceSession, student_attendance_entity_1.StudentAttendance, fee_invoice_entity_1.FeeInvoice, fee_payment_entity_1.FeePayment,
                subject_entity_1.Subject, syllabus_entity_1.Syllabus, curriculum_mapping_entity_1.CurriculumMapping, teacher_subject_entity_1.TeacherSubject,
                board_entity_1.Board, curriculum_unit_entity_1.CurriculumUnit, lesson_plan_entity_1.LessonPlan, school_calendar_entity_1.SchoolCalendar, time_slot_entity_1.TimeSlot, planned_schedule_entity_1.PlannedSchedule
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
            school_module_1.SchoolModule,
            students_module_1.StudentsModule,
            attendance_module_1.AttendanceModule,
            homework_module_1.HomeworkModule,
            exams_module_1.ExamsModule,
            report_cards_module_1.ReportCardsModule,
            communication_module_1.CommunicationModule,
            finance_module_1.FinanceModule,
            dashboard_module_1.DashboardModule,
            teacher_module_1.TeacherModule,
            parent_module_1.ParentModule,
            curriculum_module_1.CurriculumModule,
            curriculum_orchestrator_module_1.CurriculumOrchestratorModule,
            ai_module_1.AiModule,
            timetable_module_1.TimetableModule,
            substitution_module_1.SubstitutionModule,
            academic_planning_module_1.AcademicPlanningModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [seeder_service_1.SeederService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map