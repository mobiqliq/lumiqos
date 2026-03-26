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
exports.CurriculumPlan = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const academic_year_entity_1 = require("./academic-year.entity");
const class_entity_1 = require("./class.entity");
const subject_entity_1 = require("./subject.entity");
const curriculum_plan_item_entity_1 = require("./curriculum-plan-item.entity");
let CurriculumPlan = class CurriculumPlan {
};
exports.CurriculumPlan = CurriculumPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "academic_year_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CurriculumPlan.prototype, "total_topics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CurriculumPlan.prototype, "total_estimated_hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "planned_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], CurriculumPlan.prototype, "planned_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'draft' }) // draft, active, completed
    ,
    __metadata("design:type", String)
], CurriculumPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], CurriculumPlan.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    (0, typeorm_1.JoinColumn)({ name: 'academic_year_id' }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], CurriculumPlan.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], CurriculumPlan.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], CurriculumPlan.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => curriculum_plan_item_entity_1.CurriculumPlanItem, item => item.plan),
    __metadata("design:type", Array)
], CurriculumPlan.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumPlan.prototype, "updated_at", void 0);
exports.CurriculumPlan = CurriculumPlan = __decorate([
    (0, typeorm_1.Entity)()
], CurriculumPlan);
