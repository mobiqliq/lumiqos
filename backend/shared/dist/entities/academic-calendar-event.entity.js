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
exports.AcademicCalendarEvent = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const academic_year_entity_1 = require("./academic-year.entity");
let AcademicCalendarEvent = class AcademicCalendarEvent {
};
exports.AcademicCalendarEvent = AcademicCalendarEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicCalendarEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademicCalendarEvent.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AcademicCalendarEvent.prototype, "academic_year_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AcademicCalendarEvent.prototype, "month_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], AcademicCalendarEvent.prototype, "month_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', array: true, default: '{}' }),
    __metadata("design:type", Array)
], AcademicCalendarEvent.prototype, "working_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AcademicCalendarEvent.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'pending' }) // pending, submitted, approved
    ,
    __metadata("design:type", String)
], AcademicCalendarEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], AcademicCalendarEvent.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    (0, typeorm_1.JoinColumn)({ name: 'academic_year_id' }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], AcademicCalendarEvent.prototype, "academic_year", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AcademicCalendarEvent.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AcademicCalendarEvent.prototype, "updated_at", void 0);
exports.AcademicCalendarEvent = AcademicCalendarEvent = __decorate([
    (0, typeorm_1.Entity)()
], AcademicCalendarEvent);
