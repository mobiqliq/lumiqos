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
exports.SchoolCalendar = exports.DayType = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const academic_year_entity_1 = require("./academic-year.entity");
var DayType;
(function (DayType) {
    DayType["TEACHING_DAY"] = "Teaching_Day";
    DayType["HOLIDAY"] = "Holiday";
    DayType["ACTIVITY_DAY"] = "Activity_Day";
    DayType["EXAM_DAY"] = "Exam_Day";
    DayType["PRE_EXAM"] = "Pre_Exam";
    DayType["POST_EVENT"] = "Post_Event";
    DayType["BUFFER_DAY"] = "Buffer_Day";
    DayType["BAGLESS_DAY"] = "Bagless_Day";
})(DayType || (exports.DayType = DayType = {}));
let SchoolCalendar = class SchoolCalendar {
    id;
    school_id;
    academic_year_id;
    date;
    day_type;
    is_working_day;
    description;
    school;
    academicYear;
    created_at;
    updated_at;
};
exports.SchoolCalendar = SchoolCalendar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "academic_year_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DayType,
        default: DayType.TEACHING_DAY
    }),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "day_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SchoolCalendar.prototype, "is_working_day", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SchoolCalendar.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], SchoolCalendar.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear),
    (0, typeorm_1.JoinColumn)({ name: 'academic_year_id' }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], SchoolCalendar.prototype, "academicYear", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SchoolCalendar.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SchoolCalendar.prototype, "updated_at", void 0);
exports.SchoolCalendar = SchoolCalendar = __decorate([
    (0, typeorm_1.Entity)('school_calendar'),
    (0, typeorm_1.Unique)(['school_id', 'date'])
], SchoolCalendar);
//# sourceMappingURL=school-calendar.entity.js.map