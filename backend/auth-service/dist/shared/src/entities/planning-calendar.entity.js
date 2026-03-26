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
exports.PlanningCalendar = void 0;
const typeorm_1 = require("typeorm");
const academic_plan_entity_1 = require("./academic-plan.entity");
let PlanningCalendar = class PlanningCalendar {
    id;
    plan_id;
    date;
    type;
    metadata;
    plan;
    created_at;
    updated_at;
};
exports.PlanningCalendar = PlanningCalendar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlanningCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlanningCalendar.prototype, "plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], PlanningCalendar.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], PlanningCalendar.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PlanningCalendar.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_plan_entity_1.AcademicPlan),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", academic_plan_entity_1.AcademicPlan)
], PlanningCalendar.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PlanningCalendar.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PlanningCalendar.prototype, "updated_at", void 0);
exports.PlanningCalendar = PlanningCalendar = __decorate([
    (0, typeorm_1.Entity)()
], PlanningCalendar);
//# sourceMappingURL=planning-calendar.entity.js.map