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
exports.CurriculumPlanItem = void 0;
const typeorm_1 = require("typeorm");
const curriculum_plan_entity_1 = require("./curriculum-plan.entity");
const syllabus_entity_1 = require("./syllabus.entity");
let CurriculumPlanItem = class CurriculumPlanItem {
    id;
    plan_id;
    topic_id;
    planned_date;
    planned_sessions;
    status;
    plan;
    syllabus;
    created_at;
    updated_at;
};
exports.CurriculumPlanItem = CurriculumPlanItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CurriculumPlanItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumPlanItem.prototype, "plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CurriculumPlanItem.prototype, "topic_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], CurriculumPlanItem.prototype, "planned_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], CurriculumPlanItem.prototype, "planned_sessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'pending' }),
    __metadata("design:type", String)
], CurriculumPlanItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => curriculum_plan_entity_1.CurriculumPlan, plan => plan.items),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", curriculum_plan_entity_1.CurriculumPlan)
], CurriculumPlanItem.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => syllabus_entity_1.Syllabus, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'topic_id' }),
    __metadata("design:type", syllabus_entity_1.Syllabus)
], CurriculumPlanItem.prototype, "syllabus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumPlanItem.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumPlanItem.prototype, "updated_at", void 0);
exports.CurriculumPlanItem = CurriculumPlanItem = __decorate([
    (0, typeorm_1.Entity)()
], CurriculumPlanItem);
//# sourceMappingURL=curriculum-plan-item.entity.js.map