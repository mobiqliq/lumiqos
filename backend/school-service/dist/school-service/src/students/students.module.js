"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const students_controller_1 = require("./students.controller");
const students_service_1 = require("./students.service");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const student_document_entity_1 = require("../../../shared/src/entities/student-document.entity");
const student_health_record_entity_1 = require("../../../shared/src/entities/student-health-record.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const homework_assignment_entity_1 = require("../../../shared/src/entities/homework-assignment.entity");
const homework_submission_entity_1 = require("../../../shared/src/entities/homework-submission.entity");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                student_entity_1.Student,
                student_enrollment_entity_1.StudentEnrollment,
                student_guardian_entity_1.StudentGuardian,
                student_document_entity_1.StudentDocument,
                student_health_record_entity_1.StudentHealthRecord,
                academic_year_entity_1.AcademicYear,
                class_entity_1.Class,
                section_entity_1.Section,
                homework_assignment_entity_1.HomeworkAssignment,
                homework_submission_entity_1.HomeworkSubmission
            ])
        ],
        controllers: [students_controller_1.StudentsController],
        providers: [students_service_1.StudentsService],
        exports: [students_service_1.StudentsService],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map