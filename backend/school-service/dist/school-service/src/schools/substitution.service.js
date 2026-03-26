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
exports.SubstitutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
let SubstitutionService = class SubstitutionService {
    scheduleRepo;
    userRepo;
    teacherSubjectRepo;
    constructor(scheduleRepo, userRepo, teacherSubjectRepo) {
        this.scheduleRepo = scheduleRepo;
        this.userRepo = userRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
    }
    async findSubstitute(absentTeacherId, date, slotId) {
        const missingLesson = await this.scheduleRepo.findOne({
            where: {
                teacher_id: absentTeacherId,
                planned_date: date,
                slot_id: slotId
            },
            relations: ['lesson', 'subject', 'teacher']
        });
        if (!missingLesson) {
            return { message: 'No lesson scheduled for this teacher at this time.' };
        }
        const subjectId = missingLesson.subject_id;
        const lessonTitle = missingLesson.title_override || missingLesson.lesson?.title || 'General Lesson';
        const allTeachers = await this.userRepo.find({
            where: { id: (0, typeorm_2.Not)(absentTeacherId) }
        });
        const busySchedules = await this.scheduleRepo.find({
            where: { planned_date: date, slot_id: slotId },
            select: ['teacher_id']
        });
        const busyTeacherIds = busySchedules.map(s => s.teacher_id).filter(id => !!id);
        const freeTeachers = allTeachers.filter(t => !busyTeacherIds.includes(t.id));
        if (freeTeachers.length === 0) {
            return {
                alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
                recommendation: 'No free teachers available for this slot. Resource conflict detected.',
                substitution_type: 'NONE'
            };
        }
        const competentTeacherSubjects = await this.teacherSubjectRepo.find({
            where: {
                teacher_id: (0, typeorm_2.In)(freeTeachers.map(t => t.id)),
                subject_id: subjectId
            },
            relations: ['teacher']
        });
        if (competentTeacherSubjects.length > 0) {
            const bestMatch = competentTeacherSubjects[0].teacher;
            return {
                alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
                recommendation: `${bestMatch.first_name} ${bestMatch.last_name} is free and has the competency to cover "${lessonTitle}" today.`,
                substitution_type: 'PEDAGOGICAL_MATCH',
                teacher_id: bestMatch.id
            };
        }
        const fallback = freeTeachers[0];
        return {
            alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
            recommendation: `${fallback.first_name} ${fallback.last_name} is free for general supervision (No direct subject match).`,
            substitution_type: 'GENERAL_SUPERVISION',
            teacher_id: fallback.id
        };
    }
    async executeHandover(outgoingTeacherId, incomingTeacherId, effectiveDate) {
        const schedules = await this.scheduleRepo.find({
            where: {
                teacher_id: outgoingTeacherId,
                status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED,
                planned_date: (0, typeorm_2.MoreThanOrEqual)(effectiveDate)
            },
            relations: ['class', 'subject', 'lesson']
        });
        if (schedules.length === 0) {
            return { message: 'No scheduled lessons found for handover.', count: 0, handover_report: [] };
        }
        const affectedSections = new Set();
        for (const schedule of schedules) {
            schedule.teacher_id = incomingTeacherId;
            if (schedule.section_id)
                affectedSections.add(schedule.section_id);
        }
        await this.scheduleRepo.save(schedules);
        const handoverReport = [];
        for (const sectionId of affectedSections) {
            const lastCompleted = await this.scheduleRepo.findOne({
                where: {
                    section_id: sectionId,
                    status: planned_schedule_entity_1.ScheduleStatus.COMPLETED
                },
                order: {
                    actual_completion_date: 'DESC'
                },
                relations: ['class', 'subject', 'lesson']
            });
            const completedCount = await this.scheduleRepo.count({
                where: { section_id: sectionId, status: planned_schedule_entity_1.ScheduleStatus.COMPLETED }
            });
            const scheduledSoFar = await this.scheduleRepo.count({
                where: { section_id: sectionId, planned_date: (0, typeorm_2.LessThanOrEqual)(effectiveDate) }
            });
            const velocity = scheduledSoFar > 0 ? (completedCount / scheduledSoFar).toFixed(2) : '1.00';
            if (lastCompleted) {
                handoverReport.push({
                    section_id: sectionId,
                    class_name: lastCompleted.class?.name || lastCompleted.class?.class_name || 'Unknown Class',
                    subject_name: lastCompleted.subject?.name || lastCompleted.subject?.subject_name || 'Unknown Subject',
                    last_completed_lesson: lastCompleted.lesson?.title || lastCompleted.title_override || 'N/A',
                    completion_date: lastCompleted.actual_completion_date,
                    velocity_score: parseFloat(velocity)
                });
            }
        }
        return {
            message: `Successfully handed over ${schedules.length} periods.`,
            count: schedules.length,
            handover_report: handoverReport
        };
    }
};
exports.SubstitutionService = SubstitutionService;
exports.SubstitutionService = SubstitutionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubstitutionService);
//# sourceMappingURL=substitution.service.js.map