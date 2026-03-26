"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const school_controller_1 = require("./school.controller");
const school_service_1 = require("./school.service");
const academic_year_controller_1 = require("./academic-year.controller");
const academic_year_service_1 = require("./academic-year.service");
const academic_controller_1 = require("./academic.controller");
const academic_service_1 = require("./academic.service");
const students_service_1 = require("../students/students.service");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const role_entity_1 = require("../../../shared/src/entities/role.entity");
const permission_entity_1 = require("../../../shared/src/entities/permission.entity");
const role_permission_entity_1 = require("../../../shared/src/entities/role-permission.entity");
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
const period_configuration_entity_1 = require("../../../shared/src/entities/period-configuration.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const syllabus_topic_entity_1 = require("../../../shared/src/entities/syllabus-topic.entity");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
const curriculum_unit_entity_1 = require("../../../shared/src/entities/curriculum-unit.entity");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const school_calendar_entity_1 = require("../../../shared/src/entities/school-calendar.entity");
const time_slot_entity_1 = require("../../../shared/src/entities/time-slot.entity");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const academic_calendar_service_1 = require("./academic-calendar.service");
const ncert_seeder_service_1 = require("../database/ncert-seeder.service");
const pedagogical_pour_service_1 = require("./pedagogical-pour.service");
const recovery_strategist_service_1 = require("./recovery-strategist.service");
const substitution_service_1 = require("./substitution.service");
const compliance_auditor_service_1 = require("./compliance-auditor.service");
const parity_auditor_service_1 = require("./parity-auditor.service");
const what_if_simulator_service_1 = require("./what-if-simulator.service");
const academic_gateway_1 = require("./academic.gateway");
const onboarding_service_1 = require("./onboarding.service");
const teacher_health_service_1 = require("./teacher-health.service");
const resource_auditor_service_1 = require("./resource-auditor.service");
const jwt_1 = require("@nestjs/jwt");
let SchoolModule = class SchoolModule {
};
exports.SchoolModule = SchoolModule;
exports.SchoolModule = SchoolModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                school_entity_1.School, user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, role_permission_entity_1.RolePermission, academic_year_entity_1.AcademicYear, class_entity_1.Class, section_entity_1.Section,
                subject_entity_1.Subject, teacher_subject_entity_1.TeacherSubject, student_entity_1.Student, student_enrollment_entity_1.StudentEnrollment, student_guardian_entity_1.StudentGuardian,
                student_document_entity_1.StudentDocument, student_health_record_entity_1.StudentHealthRecord, period_configuration_entity_1.PeriodConfiguration, syllabus_entity_1.Syllabus,
                syllabus_topic_entity_1.SyllabusTopic, board_entity_1.Board, curriculum_unit_entity_1.CurriculumUnit, lesson_plan_entity_1.LessonPlan, school_calendar_entity_1.SchoolCalendar,
                time_slot_entity_1.TimeSlot, planned_schedule_entity_1.PlannedSchedule
            ]),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'lumiqos-super-secret-key',
            }),
        ],
        controllers: [school_controller_1.SchoolController, academic_year_controller_1.AcademicYearController, academic_controller_1.AcademicController],
        providers: [
            school_service_1.SchoolService, academic_year_service_1.AcademicYearService, academic_service_1.AcademicService,
            academic_calendar_service_1.AcademicCalendarService, ncert_seeder_service_1.NCERTSeederService, pedagogical_pour_service_1.PedagogicalPourService,
            recovery_strategist_service_1.RecoveryStrategistService, substitution_service_1.SubstitutionService, compliance_auditor_service_1.ComplianceAuditorService,
            parity_auditor_service_1.ParityAuditorService, what_if_simulator_service_1.WhatIfSimulatorService, academic_gateway_1.AcademicGateway, onboarding_service_1.OnboardingService,
            teacher_health_service_1.TeacherHealthService, resource_auditor_service_1.ResourceAuditorService
        ],
        exports: [school_service_1.SchoolService, academic_year_service_1.AcademicYearService, academic_service_1.AcademicService, students_service_1.StudentsService, substitution_service_1.SubstitutionService]
    })
], SchoolModule);
//# sourceMappingURL=school.module.js.map