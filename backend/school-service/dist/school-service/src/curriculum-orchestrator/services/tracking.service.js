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
exports.CurriculumTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const curriculum_plan_entity_1 = require("../../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../../shared/src/entities/curriculum-plan-item.entity");
const teaching_log_entity_1 = require("../../../../shared/src/entities/teaching-log.entity");
const academic_year_entity_1 = require("../../../../shared/src/entities/academic-year.entity");
const academic_calendar_event_entity_1 = require("../../../../shared/src/entities/academic-calendar-event.entity");
const subject_entity_1 = require("../../../../shared/src/entities/subject.entity");
let CurriculumTrackingService = class CurriculumTrackingService {
    planRepo;
    itemRepo;
    logRepo;
    yearRepo;
    calendarRepo;
    subjectRepo;
    constructor(planRepo, itemRepo, logRepo, yearRepo, calendarRepo, subjectRepo) {
        this.planRepo = planRepo;
        this.itemRepo = itemRepo;
        this.logRepo = logRepo;
        this.yearRepo = yearRepo;
        this.calendarRepo = calendarRepo;
        this.subjectRepo = subjectRepo;
    }
    async logTeaching(schoolId, teacherId, dto) {
        const log = this.logRepo.create({
            ...dto,
            school_id: schoolId,
            teacher_id: teacherId
        });
        const savedLog = await this.logRepo.save(log);
        const plan = await this.planRepo.findOne({
            where: { school_id: schoolId, class_id: dto.class_id, subject_id: dto.subject_id, status: 'active' }
        });
        if (plan) {
            const items = await this.itemRepo.find({
                where: { plan_id: plan.id, status: 'pending' }
            });
            const topicIds = new Set(dto.topics_covered);
            for (const item of items) {
                if (topicIds.has(item.topic_id)) {
                    item.status = 'completed';
                    await this.itemRepo.save(item);
                }
            }
        }
        return savedLog;
    }
    async getCurriculumSummary(schoolId, academicYearId, classId, subjectId) {
        const plan = await this.planRepo.findOne({
            where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId, status: 'active' },
            relations: ['items']
        });
        if (!plan)
            return null;
        const totalTopics = plan.items.length;
        const completedTopics = plan.items.filter(i => i.status === 'completed').length;
        const remainingTopics = totalTopics - completedTopics;
        const today = new Date().toISOString().split('T')[0];
        const delayedTopicsList = plan.items.filter(i => i.status === 'pending' && i.planned_date < today);
        const delayedTopics = delayedTopicsList.length;
        let delayDays = 0;
        if (delayedTopics > 0) {
            const earliestDelayed = new Date(Math.min(...delayedTopicsList.map(i => new Date(i.planned_date).getTime())));
            delayDays = Math.ceil((new Date(today).getTime() - earliestDelayed.getTime()) / (1000 * 3600 * 24));
        }
        let remainingDays = 0;
        let curr = new Date(today);
        const end = new Date(plan.planned_end_date);
        while (curr <= end) {
            if (curr.getDay() !== 0)
                remainingDays++;
            curr.setDate(curr.getDate() + 1);
        }
        let riskStatus = 'ON_TRACK';
        if (remainingDays <= 0 && remainingTopics > 0) {
            riskStatus = 'MISSED_DEADLINE';
        }
        else if (delayedTopics / totalTopics > 0.1) {
            riskStatus = 'DELAYED';
        }
        else if (remainingTopics > remainingDays) {
            riskStatus = 'AT_RISK';
        }
        const futureItems = plan.items
            .filter(i => i.status === 'pending' && i.planned_date >= today)
            .sort((a, b) => a.planned_date.localeCompare(b.planned_date));
        const nextScheduledDate = futureItems.length > 0 ? futureItems[0].planned_date : null;
        return {
            plan_id: plan.id,
            subject_id: subjectId,
            completion_percentage: Math.round((completedTopics / totalTopics) * 100) || 0,
            total_topics: totalTopics,
            completed_topics: completedTopics,
            delayed_topics: delayedTopics,
            delay_days: delayDays,
            remaining_topics: remainingTopics,
            remaining_days: remainingDays,
            risk_status: riskStatus,
            next_scheduled_date: nextScheduledDate
        };
    }
};
exports.CurriculumTrackingService = CurriculumTrackingService;
exports.CurriculumTrackingService = CurriculumTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(curriculum_plan_entity_1.CurriculumPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(curriculum_plan_item_entity_1.CurriculumPlanItem)),
    __param(2, (0, typeorm_1.InjectRepository)(teaching_log_entity_1.TeachingLog)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(4, (0, typeorm_1.InjectRepository)(academic_calendar_event_entity_1.AcademicCalendarEvent)),
    __param(5, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CurriculumTrackingService);
//# sourceMappingURL=tracking.service.js.map