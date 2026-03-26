"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const exams_controller_1 = require("./exams.controller");
const exams_service_1 = require("./exams.service");
const exam_type_entity_1 = require("../../../shared/src/entities/exam-type.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const exam_subject_entity_1 = require("../../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../../shared/src/entities/student-marks.entity");
const grade_scale_entity_1 = require("../../../shared/src/entities/grade-scale.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const ai_module_1 = require("../ai/ai.module");
let ExamsModule = class ExamsModule {
};
exports.ExamsModule = ExamsModule;
exports.ExamsModule = ExamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                exam_type_entity_1.ExamType,
                exam_entity_1.Exam,
                exam_subject_entity_1.ExamSubject,
                student_marks_entity_1.StudentMarks,
                grade_scale_entity_1.GradeScale,
                student_enrollment_entity_1.StudentEnrollment,
            ]),
            ai_module_1.AiModule
        ],
        controllers: [exams_controller_1.ExamsController],
        providers: [exams_service_1.ExamsService],
        exports: [exams_service_1.ExamsService],
    })
], ExamsModule);
//# sourceMappingURL=exams.module.js.map