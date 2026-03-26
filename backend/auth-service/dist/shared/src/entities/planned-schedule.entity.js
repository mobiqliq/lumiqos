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
exports.PlannedSchedule = exports.ScheduleStatus = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const academic_year_entity_1 = require("./academic-year.entity");
const lesson_plan_entity_1 = require("./lesson-plan.entity");
const school_calendar_entity_1 = require("./school-calendar.entity");
const class_entity_1 = require("./class.entity");
const subject_entity_1 = require("./subject.entity");
const user_entity_1 = require("./user.entity");
const time_slot_entity_1 = require("./time-slot.entity");
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["SCHEDULED"] = "Scheduled";
    ScheduleStatus["COMPLETED"] = "Completed";
    ScheduleStatus["DELAYED"] = "Delayed";
    ScheduleStatus["SKIPPED"] = "Skipped";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
let PlannedSchedule = class PlannedSchedule {
    id;
    school_id;
    academic_year_id;
    section_id;
    lesson_id;
    calendar_id;
    class_id;
    subject_id;
    planned_date;
    actual_completion_date;
    deviation_days;
    title_override;
    teacher_id;
    slot_id;
    status;
    school;
    academicYear;
    lesson;
    calendar;
    class;
    subject;
    teacher;
    slot;
    created_at;
    updated_at;
};
exports.PlannedSchedule = PlannedSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "academic_year_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "section_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "lesson_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "calendar_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "class_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "subject_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "planned_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "actual_completion_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PlannedSchedule.prototype, "deviation_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "title_override", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "slot_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ScheduleStatus,
        default: ScheduleStatus.SCHEDULED
    }),
    __metadata("design:type", String)
], PlannedSchedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], PlannedSchedule.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    (0, typeorm_1.JoinColumn)({ name: 'academic_year_id' }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], PlannedSchedule.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lesson_plan_entity_1.LessonPlan),
    (0, typeorm_1.JoinColumn)({ name: 'lesson_id' }),
    __metadata("design:type", lesson_plan_entity_1.LessonPlan)
], PlannedSchedule.prototype, "lesson", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_calendar_entity_1.SchoolCalendar),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_id' }),
    __metadata("design:type", school_calendar_entity_1.SchoolCalendar)
], PlannedSchedule.prototype, "calendar", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => class_entity_1.Class),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", class_entity_1.Class)
], PlannedSchedule.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", subject_entity_1.Subject)
], PlannedSchedule.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", user_entity_1.User)
], PlannedSchedule.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => time_slot_entity_1.TimeSlot),
    (0, typeorm_1.JoinColumn)({ name: 'slot_id' }),
    __metadata("design:type", time_slot_entity_1.TimeSlot)
], PlannedSchedule.prototype, "slot", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PlannedSchedule.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PlannedSchedule.prototype, "updated_at", void 0);
exports.PlannedSchedule = PlannedSchedule = __decorate([
    (0, typeorm_1.Entity)('planned_schedule')
], PlannedSchedule);
//# sourceMappingURL=planned-schedule.entity.js.map