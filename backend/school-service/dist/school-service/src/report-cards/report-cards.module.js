"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const report_cards_controller_1 = require("./report-cards.controller");
const report_cards_service_1 = require("./report-cards.service");
const report_card_entity_1 = require("../../../shared/src/entities/report-card.entity");
const report_card_subject_entity_1 = require("../../../shared/src/entities/report-card-subject.entity");
const exam_subject_entity_1 = require("../../../shared/src/entities/exam-subject.entity");
const student_marks_entity_1 = require("../../../shared/src/entities/student-marks.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const grade_scale_entity_1 = require("../../../shared/src/entities/grade-scale.entity");
let ReportCardsModule = class ReportCardsModule {
};
exports.ReportCardsModule = ReportCardsModule;
exports.ReportCardsModule = ReportCardsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                report_card_entity_1.ReportCard,
                report_card_subject_entity_1.ReportCardSubject,
                exam_subject_entity_1.ExamSubject,
                student_marks_entity_1.StudentMarks,
                student_enrollment_entity_1.StudentEnrollment,
                grade_scale_entity_1.GradeScale
            ])
        ],
        controllers: [report_cards_controller_1.ReportCardsController],
        providers: [report_cards_service_1.ReportCardsService],
        exports: [report_cards_service_1.ReportCardsService],
    })
], ReportCardsModule);
//# sourceMappingURL=report-cards.module.js.map