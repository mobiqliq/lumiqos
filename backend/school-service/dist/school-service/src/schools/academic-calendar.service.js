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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const school_calendar_entity_1 = require("../../../shared/src/entities/school-calendar.entity");
const time_slot_entity_1 = require("../../../shared/src/entities/time-slot.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
let AcademicCalendarService = class AcademicCalendarService {
    calendarRepo;
    slotRepo;
    yearRepo;
    teacherSubjectRepo;
    classRepo;
    subjectRepo;
    scheduleRepo;
    constructor(calendarRepo, slotRepo, yearRepo, teacherSubjectRepo, classRepo, subjectRepo, scheduleRepo) {
        this.calendarRepo = calendarRepo;
        this.slotRepo = slotRepo;
        this.yearRepo = yearRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.scheduleRepo = scheduleRepo;
    }
    async generateYearCalendar(schoolId, yearId) {
        const year = await this.yearRepo.findOne({ where: { id: yearId } });
        if (!year)
            throw new Error('Academic year not found');
        const startDate = new Date(year.start_date);
        const endDate = new Date(year.end_date);
        const current = new Date(startDate);
        const entries = [];
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;
            entries.push(this.calendarRepo.create({
                school_id: schoolId,
                academic_year_id: yearId,
                date: dateStr,
                day_type: isSunday ? school_calendar_entity_1.DayType.HOLIDAY : school_calendar_entity_1.DayType.TEACHING_DAY,
                is_working_day: !isSunday,
                description: isSunday ? 'Sunday' : undefined
            }));
            current.setDate(current.getDate() + 1);
        }
        return this.calendarRepo.save(entries);
    }
    async calculateTeachingCapacity(schoolId, yearId) {
        const teachingDays = await this.calendarRepo.count({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                is_working_day: true,
                day_type: school_calendar_entity_1.DayType.TEACHING_DAY
            }
        });
        const slots = await this.slotRepo.find({ where: { school_id: schoolId } });
        let minutesPerDay = 0;
        slots.forEach(slot => {
            const [startH, startM] = slot.start_time.split(':').map(Number);
            const [endH, endM] = slot.end_time.split(':').map(Number);
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            minutesPerDay += duration;
        });
        return teachingDays * minutesPerDay;
    }
    async validateCurriculumFit(availableMinutes, syllabusMinutes) {
        if (syllabusMinutes > availableMinutes) {
            return {
                valid: false,
                warning: `Curriculum overflow! Syllabus requires ${syllabusMinutes} mins, but only ${availableMinutes} are available.`,
                deficit: syllabusMinutes - availableMinutes
            };
        }
        return { valid: true, warning: null, deficit: 0 };
    }
    async calculateSubjectAvailability(schoolId, yearId, classId, sectionId, subjectId) {
        const mapping = await this.teacherSubjectRepo.findOne({
            where: { school_id: schoolId, class_id: classId, section_id: sectionId, subject_id: subjectId }
        });
        const periodsPerDay = mapping?.periods_per_day || 1;
        const teachingDays = await this.calendarRepo.count({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                day_type: school_calendar_entity_1.DayType.TEACHING_DAY,
                is_working_day: true
            }
        });
        const totalAvailablePeriods = teachingDays * periodsPerDay;
        const cls = await this.classRepo.findOne({ where: { id: classId } });
        const sub = await this.subjectRepo.findOne({ where: { id: subjectId } });
        return {
            class: cls?.name,
            subject: sub?.name,
            total_available_periods: totalAvailablePeriods,
            formatted: `${cls?.name} | ${sub?.name} | Total Available Periods: ${totalAvailablePeriods}`
        };
    }
    async processEmergencyClosure(schoolId, date) {
        const calendarEntry = await this.calendarRepo.findOne({ where: { school_id: schoolId, date: date } });
        if (calendarEntry) {
            calendarEntry.is_working_day = false;
            calendarEntry.day_type = school_calendar_entity_1.DayType.HOLIDAY;
            calendarEntry.description = 'Emergency Closure (Rainy Day)';
            await this.calendarRepo.save(calendarEntry);
        }
        const affectedCount = await this.scheduleRepo.count({
            where: { school_id: schoolId, planned_date: date }
        });
        return {
            date: date,
            affected_lessons: affectedCount,
            recovery_plans: [
                {
                    id: 'EMER_PLAN_A',
                    name: 'Plan A: Buffer Burn',
                    description: 'Convert existing Revision/Buffer slots into teaching periods to reclaim the lost day.',
                    action: 'BURN_BUFFERS'
                },
                {
                    id: 'EMER_PLAN_B',
                    name: 'Plan B: Saturday Swap',
                    description: 'Convert the very next non-working Saturday into a full teaching day.',
                    action: 'SATURDAY_SWAP'
                },
                {
                    id: 'EMER_PLAN_C',
                    name: 'Plan C: Pedagogical Compression',
                    description: 'Merge upcoming curriculum units into fewer slots to maintain the March Board Exam deadline.',
                    action: 'MERGE_UNITS'
                }
            ]
        };
    }
    async initCalendarBoundaries(schoolId, yearId, startDate, endDate, holidays) {
        await this.calendarRepo.delete({ school_id: schoolId, academic_year_id: yearId });
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);
        const entries = [];
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;
            const holiday = holidays.find(h => h.date === dateStr);
            entries.push(this.calendarRepo.create({
                school_id: schoolId,
                academic_year_id: yearId,
                date: dateStr,
                day_type: holiday ? school_calendar_entity_1.DayType.HOLIDAY : (isSunday ? school_calendar_entity_1.DayType.HOLIDAY : school_calendar_entity_1.DayType.TEACHING_DAY),
                is_working_day: !holiday && !isSunday,
                description: holiday ? holiday.description : (isSunday ? 'Sunday' : undefined)
            }));
            current.setDate(current.getDate() + 1);
        }
        return this.calendarRepo.save(entries);
    }
    async getAcademicGaps(schoolId, yearId) {
        const year = await this.yearRepo.findOne({ where: { id: yearId } });
        if (!year)
            return [];
        const termEnd = new Date(year.end_date);
        const lastLessons = await this.scheduleRepo
            .createQueryBuilder('s')
            .select(['s.subject_id', 'MAX(s.planned_date) as last_date'])
            .where('s.school_id = :schoolId', { schoolId })
            .andWhere('s.academic_year_id = :yearId', { yearId })
            .groupBy('s.subject_id')
            .getRawMany();
        const gaps = [];
        for (const ll of lastLessons) {
            const lastDate = new Date(ll.last_date);
            const diffDays = Math.ceil((termEnd.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 15) {
                const sub = await this.subjectRepo.findOne({ where: { id: ll.subject_id } });
                gaps.push({
                    subject_id: ll.subject_id,
                    subject_name: sub?.name,
                    last_date: ll.last_date,
                    buffer_days: diffDays,
                    risk: diffDays < 5 ? 'CRITICAL' : 'WARNING',
                    message: `Warning: ${sub?.name} finishes on ${ll.last_date}, leaving only ${diffDays} days for Revision before year end.`
                });
            }
        }
        return gaps;
    }
    async rippleScheduleChange(scheduleId, newDate) {
        const item = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
        if (!item)
            return;
        const oldDate = item.planned_date;
        item.planned_date = newDate;
        await this.scheduleRepo.save(item);
        const downstream = await this.scheduleRepo.find({
            where: {
                school_id: item.school_id,
                academic_year_id: item.academic_year_id,
                class_id: item.class_id,
                section_id: item.section_id,
                subject_id: item.subject_id,
                planned_date: (0, typeorm_2.Between)(oldDate, '2099-12-31')
            },
            order: { planned_date: 'ASC' }
        });
        const itemsToShift = downstream.filter(d => d.id !== scheduleId);
        const teachingDays = await this.calendarRepo.find({
            where: {
                school_id: item.school_id,
                academic_year_id: item.academic_year_id,
                date: (0, typeorm_2.Between)(newDate, '2099-12-31'),
                is_working_day: true
            },
            order: { date: 'ASC' }
        });
        let dayIdx = 0;
        if (teachingDays[0]?.date === newDate)
            dayIdx = 1;
        for (const ds of itemsToShift) {
            if (dayIdx < teachingDays.length) {
                ds.planned_date = teachingDays[dayIdx].date;
                dayIdx++;
            }
        }
        await this.scheduleRepo.save(itemsToShift);
        return { shifted: itemsToShift.length };
    }
};
exports.AcademicCalendarService = AcademicCalendarService;
exports.AcademicCalendarService = AcademicCalendarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(school_calendar_entity_1.SchoolCalendar)),
    __param(1, (0, typeorm_1.InjectRepository)(time_slot_entity_1.TimeSlot)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(3, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(4, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(5, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(6, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AcademicCalendarService);
//# sourceMappingURL=academic-calendar.service.js.map