"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonPlan = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const class_entity_1 = require("./class.entity");
const subject_entity_1 = require("./subject.entity");
const user_entity_1 = require("./user.entity");
const curriculum_unit_entity_1 = require("./curriculum-unit.entity");
console.log('LOADING LESSON PLAN ENTITY FROM SHARED/SRC');
let LessonPlan = class LessonPlan {
    id;
    school_id;
    class_id;
    subject_id;
    teacher_id;
    title;
    learning_outcome;
    estimated_minutes;
    complexity_index;
    unit_id;
    unit;
    plan_data;
    tags;
    school;
    class;
    subject;
    teacher;
    created_at;
    updated_at;
};
exports.LessonPlan = LessonPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LessonPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LessonPlan.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LessonPlan.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LessonPlan.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LessonPlan.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LessonPlan.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LessonPlan.prototype, "learning_outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 40 }),
    __metadata("design:type", Number)
], LessonPlan.prototype, "estimated_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 5 }),
    __metadata("design:type", Number)
], LessonPlan.prototype, "complexity_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LessonPlan.prototype, "unit_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => curriculum_unit_entity_1.CurriculumUnit, (u) => u.lessons),
    (0, typeorm_1.JoinColumn)({ name: 'unit_id' }),
    __metadata("design:type", curriculum_unit_entity_1.CurriculumUnit)
], LessonPlan.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LessonPlan.prototype, "plan_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], LessonPlan.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], LessonPlan.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], LessonPlan.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], LessonPlan.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", user_entity_1.User)
], LessonPlan.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LessonPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LessonPlan.prototype, "updated_at", void 0);
exports.LessonPlan = LessonPlan = __decorate([
    (0, typeorm_1.Entity)('lesson_plans_v3')
], LessonPlan);
//# sourceMappingURL=lesson-plan.entity.js.map