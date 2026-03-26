"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumOrchestratorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const curriculum_plan_entity_1 = require("../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
const teaching_log_entity_1 = require("../../../shared/src/entities/teaching-log.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../shared/src/entities/academic-calendar-event.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const curriculum_orchestrator_controller_1 = require("./curriculum-orchestrator.controller");
const planner_service_1 = require("./services/planner.service");
const tracking_service_1 = require("./services/tracking.service");
const rescheduler_service_1 = require("./services/rescheduler.service");
const academic_planning_module_1 = require("../academic-planning/academic-planning.module");
let CurriculumOrchestratorModule = class CurriculumOrchestratorModule {
};
exports.CurriculumOrchestratorModule = CurriculumOrchestratorModule;
exports.CurriculumOrchestratorModule = CurriculumOrchestratorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            academic_planning_module_1.AcademicPlanningModule,
            typeorm_1.TypeOrmModule.forFeature([
                curriculum_plan_entity_1.CurriculumPlan,
                curriculum_plan_item_entity_1.CurriculumPlanItem,
                teaching_log_entity_1.TeachingLog,
                syllabus_entity_1.Syllabus,
                academic_calendar_event_entity_1.AcademicCalendarEvent,
                academic_year_entity_1.AcademicYear,
                subject_entity_1.Subject,
                school_entity_1.School,
                class_entity_1.Class,
                user_entity_1.User
            ]),
        ],
        controllers: [curriculum_orchestrator_controller_1.CurriculumOrchestratorController],
        providers: [
            planner_service_1.CurriculumPlannerService,
            tracking_service_1.CurriculumTrackingService,
            rescheduler_service_1.CurriculumReschedulerService,
        ],
        exports: [
            planner_service_1.CurriculumPlannerService,
            tracking_service_1.CurriculumTrackingService,
            rescheduler_service_1.CurriculumReschedulerService,
        ]
    })
], CurriculumOrchestratorModule);
//# sourceMappingURL=curriculum-orchestrator.module.js.map