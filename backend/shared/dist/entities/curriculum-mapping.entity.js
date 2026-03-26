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
exports.CurriculumMapping = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const class_entity_1 = require("./class.entity");
const subject_entity_1 = require("./subject.entity");
const user_entity_1 = require("./user.entity");
const lesson_plan_entity_1 = require("./lesson-plan.entity");
let CurriculumMapping = class CurriculumMapping {
};
exports.CurriculumMapping = CurriculumMapping;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "lesson_plan_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "mapping_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], CurriculumMapping.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], CurriculumMapping.prototype, "unit_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'scheduled' }) // scheduled, completed, skipped, modified
    ,
    __metadata("design:type", String)
], CurriculumMapping.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], CurriculumMapping.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], CurriculumMapping.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], CurriculumMapping.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", user_entity_1.User)
], CurriculumMapping.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lesson_plan_entity_1.LessonPlan, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'lesson_plan_id' }),
    __metadata("design:type", lesson_plan_entity_1.LessonPlan)
], CurriculumMapping.prototype, "lessonPlan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumMapping.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CurriculumMapping.prototype, "updated_at", void 0);
exports.CurriculumMapping = CurriculumMapping = __decorate([
    (0, typeorm_1.Entity)()
], CurriculumMapping);
