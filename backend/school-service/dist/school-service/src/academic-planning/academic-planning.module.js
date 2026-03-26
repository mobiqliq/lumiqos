"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicPlanningModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academic_planning_service_1 = require("./academic-planning.service");
const academic_planning_controller_1 = require("./academic-planning.controller");
const academic_plan_entity_1 = require("../../../shared/src/entities/academic-plan.entity");
const academic_plan_item_entity_1 = require("../../../shared/src/entities/academic-plan-item.entity");
const planning_day_entity_1 = require("../../../shared/src/entities/planning-day.entity");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../shared/src/entities/academic-calendar-event.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const curriculum_plan_entity_1 = require("../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const syllabus_topic_entity_1 = require("../../../shared/src/entities/syllabus-topic.entity");
let AcademicPlanningModule = class AcademicPlanningModule {
};
exports.AcademicPlanningModule = AcademicPlanningModule;
exports.AcademicPlanningModule = AcademicPlanningModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                academic_plan_entity_1.AcademicPlan,
                academic_plan_item_entity_1.AcademicPlanItem,
                planning_day_entity_1.PlanningDay,
                board_entity_1.Board,
                syllabus_entity_1.Syllabus,
                academic_calendar_event_entity_1.AcademicCalendarEvent,
                academic_year_entity_1.AcademicYear,
                curriculum_plan_entity_1.CurriculumPlan,
                curriculum_plan_item_entity_1.CurriculumPlanItem,
                exam_entity_1.Exam,
                class_entity_1.Class,
                subject_entity_1.Subject,
                syllabus_topic_entity_1.SyllabusTopic
            ]),
        ],
        providers: [academic_planning_service_1.AcademicPlanningService],
        controllers: [academic_planning_controller_1.AcademicPlanningController],
        exports: [academic_planning_service_1.AcademicPlanningService],
    })
], AcademicPlanningModule);
//# sourceMappingURL=academic-planning.module.js.map