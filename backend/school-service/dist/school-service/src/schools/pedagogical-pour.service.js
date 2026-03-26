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
var PedagogicalPourService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedagogicalPourService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const school_calendar_entity_1 = require("../../../shared/src/entities/school-calendar.entity");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const curriculum_unit_entity_1 = require("../../../shared/src/entities/curriculum-unit.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
let PedagogicalPourService = PedagogicalPourService_1 = class PedagogicalPourService {
    lessonPlanRepo;
    calendarRepo;
    scheduleRepo;
    unitRepo;
    sectionRepo;
    teacherSubjectRepo;
    logger = new common_1.Logger(PedagogicalPourService_1.name);
    constructor(lessonPlanRepo, calendarRepo, scheduleRepo, unitRepo, sectionRepo, teacherSubjectRepo) {
        this.lessonPlanRepo = lessonPlanRepo;
        this.calendarRepo = calendarRepo;
        this.scheduleRepo = scheduleRepo;
        this.unitRepo = unitRepo;
        this.sectionRepo = sectionRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }
    async generateBaselineSchedule(schoolId, yearId, classId, sectionId, subjectId) {
        this.logger.log(`Starting Pedagogical Pour for Class: ${classId}, Subject: ${subjectId}`);
        const units = await this.unitRepo.find({
            where: { subject_id: subjectId },
            order: { sequence_order: 'ASC' }
        });
        const allLessons = [];
        for (const unit of units) {
            const lessons = await this.lessonPlanRepo.find({
                where: { unit_id: unit.id },
                order: { complexity_index: 'ASC' }
            });
            allLessons.push(...lessons);
        }
        const teachingDays = await this.calendarRepo.find({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                is_working_day: true
            },
            order: { date: 'ASC' }
        });
        if (allLessons.length === 0 || teachingDays.length === 0) {
            return { error: 'No lessons or teaching days found to pour.' };
        }
        let targetSections = [];
        if (sectionId) {
            const sec = await this.sectionRepo.findOne({ where: { id: sectionId } });
            if (sec)
                targetSections.push(sec);
        }
        else {
            targetSections = await this.sectionRepo.find({ where: { class_id: classId } });
        }
        if (targetSections.length === 0) {
            targetSections.push({ id: undefined, class_id: classId });
        }
        const scheduledItems = [];
        const firstSection = targetSections[0];
        const firstSectionId = firstSection.id;
        const firstAssignment = await this.teacherSubjectRepo.findOne({
            where: { class_id: classId, section_id: firstSectionId, subject_id: subjectId }
        });
        const firstTeacherId = firstAssignment ? firstAssignment.teacher_id : null;
        let dayIdx = 0;
        let weeklyHighComplexityCount = 0;
        let lastWeekNum = -1;
        const masterSequence = [];
        for (let i = 0; i < allLessons.length; i++) {
            const lesson = allLessons[i];
            let dayScheduled = false;
            while (!dayScheduled && dayIdx < teachingDays.length) {
                const day = teachingDays[dayIdx];
                const dateObj = new Date(day.date);
                const weekNum = this.getWeekNumber(dateObj);
                if (weekNum !== lastWeekNum) {
                    weeklyHighComplexityCount = 0;
                    lastWeekNum = weekNum;
                }
                const paddingRequired = [school_calendar_entity_1.DayType.PRE_EXAM, school_calendar_entity_1.DayType.POST_EVENT].includes(day.day_type);
                const isHeavy = lesson.complexity_index > 8;
                if (paddingRequired && lesson.complexity_index > 4) {
                    masterSequence.push({ date: day.date, title_override: 'Revision / Buffer (Padding)' });
                    dayIdx++;
                    continue;
                }
                if (isHeavy && weeklyHighComplexityCount >= 3) {
                    masterSequence.push({ date: day.date, title_override: 'Practice / Complexity Buffer' });
                    dayIdx++;
                    continue;
                }
                masterSequence.push({
                    lesson_id: lesson.id,
                    date: day.date,
                    teacher_id: firstTeacherId || undefined
                });
                if (isHeavy)
                    weeklyHighComplexityCount++;
                const nextLesson = allLessons[i + 1];
                if (nextLesson && nextLesson.unit_id !== lesson.unit_id) {
                    dayIdx++;
                    if (dayIdx < teachingDays.length) {
                        masterSequence.push({
                            date: teachingDays[dayIdx].date,
                            title_override: `Unit Test: ${lesson.unit?.title || 'Unit Completion'}`
                        });
                    }
                }
                dayScheduled = true;
                dayIdx++;
            }
        }
        for (const section of targetSections) {
            const currentSectionId = section.id;
            const assignment = await this.teacherSubjectRepo.findOne({
                where: { class_id: classId, section_id: currentSectionId, subject_id: subjectId }
            });
            const teacherId = assignment ? assignment.teacher_id : null;
            for (const seq of masterSequence) {
                scheduledItems.push({
                    school_id: schoolId,
                    class_id: classId,
                    subject_id: subjectId,
                    section_id: currentSectionId,
                    teacher_id: teacherId || seq.teacher_id,
                    academic_year_id: yearId,
                    lesson_id: seq.lesson_id,
                    planned_date: seq.date,
                    title_override: seq.title_override,
                    status: 'Scheduled'
                });
            }
        }
        if (sectionId) {
            await this.scheduleRepo.delete({
                school_id: schoolId, academic_year_id: yearId,
                class_id: classId, subject_id: subjectId, section_id: sectionId
            });
        }
        else {
            await this.scheduleRepo.delete({
                school_id: schoolId, academic_year_id: yearId,
                class_id: classId, subject_id: subjectId
            });
        }
        const saved = await this.scheduleRepo.save(scheduledItems);
        return {
            message: 'Baseline schedule generated successfully',
            lessons_scheduled: allLessons.length,
            total_slots_used: scheduledItems.length,
            example_first_date: scheduledItems[0]?.planned_date
        };
    }
    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
};
exports.PedagogicalPourService = PedagogicalPourService;
exports.PedagogicalPourService = PedagogicalPourService = PedagogicalPourService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lesson_plan_entity_1.LessonPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(school_calendar_entity_1.SchoolCalendar)),
    __param(2, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(3, (0, typeorm_1.InjectRepository)(curriculum_unit_entity_1.CurriculumUnit)),
    __param(4, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __param(5, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PedagogicalPourService);
//# sourceMappingURL=pedagogical-pour.service.js.map