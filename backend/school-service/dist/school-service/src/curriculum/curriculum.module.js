"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const curriculum_controller_1 = require("./curriculum.controller");
const curriculum_service_1 = require("./curriculum.service");
const ai_module_1 = require("../ai/ai.module");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../shared/src/entities/academic-calendar-event.entity");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const curriculum_mapping_entity_1 = require("../../../shared/src/entities/curriculum-mapping.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
let CurriculumModule = class CurriculumModule {
};
exports.CurriculumModule = CurriculumModule;
exports.CurriculumModule = CurriculumModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([syllabus_entity_1.Syllabus, academic_calendar_event_entity_1.AcademicCalendarEvent, lesson_plan_entity_1.LessonPlan, curriculum_mapping_entity_1.CurriculumMapping, subject_entity_1.Subject, school_entity_1.School, class_entity_1.Class, teacher_subject_entity_1.TeacherSubject, curriculum_plan_item_entity_1.CurriculumPlanItem]),
            ai_module_1.AiModule
        ],
        controllers: [curriculum_controller_1.CurriculumController],
        providers: [curriculum_service_1.CurriculumService],
        exports: [curriculum_service_1.CurriculumService]
    })
], CurriculumModule);
//# sourceMappingURL=curriculum.module.js.map