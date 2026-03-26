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
exports.RecoveryStrategistService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const school_calendar_entity_1 = require("../../../shared/src/entities/school-calendar.entity");
const academic_service_1 = require("./academic.service");
let RecoveryStrategistService = class RecoveryStrategistService {
    scheduleRepo;
    calendarRepo;
    academicService;
    constructor(scheduleRepo, calendarRepo, academicService) {
        this.scheduleRepo = scheduleRepo;
        this.calendarRepo = calendarRepo;
        this.academicService = academicService;
    }
    async generateRecoveryPlans(schoolId, classId, subjectId, boardExamStartDate) {
        const velocityReport = await this.academicService.getVelocityReport(classId, subjectId, schoolId);
        const deficit = velocityReport.lagging_periods;
        if (deficit <= 0) {
            return { message: 'Class is on track. No recovery needed.', velocity: velocityReport.velocity };
        }
        const today = new Date().toISOString().split('T')[0];
        const futureSchedule = await this.scheduleRepo.find({
            where: {
                school_id: schoolId,
                class_id: classId,
                subject_id: subjectId,
                planned_date: (0, typeorm_2.MoreThan)(today)
            },
            order: { planned_date: 'ASC' },
            relations: ['lesson']
        });
        const futureCalendar = await this.calendarRepo.find({
            where: {
                school_id: schoolId,
                date: (0, typeorm_2.MoreThan)(today)
            },
            order: { date: 'ASC' }
        });
        const buffers = futureSchedule.filter(s => s.title_override?.includes('Revision') || s.title_override?.includes('Buffer'));
        const planA = {
            id: 'PLAN_A',
            name: 'Plan A: The Buffer Burn',
            logic: 'Reallocate remaining Revision/Buffer periods to catch up.',
            action: `Convert ${Math.min(deficit, buffers.length)} future buffer slots into teaching periods.`,
            success_probability: Math.min(100, Math.round((buffers.length / deficit) * 100)),
            impact: 'No change to term dates, but reduces student revision time.',
            estimated_end_date: futureSchedule.length > 0 ? futureSchedule[futureSchedule.length - 1].planned_date : today
        };
        const easyLessons = futureSchedule.filter(s => s.lesson && s.lesson.complexity_index <= 3);
        let mergeablePairs = 0;
        for (let i = 0; i < easyLessons.length - 1; i++) {
            mergeablePairs++;
            i++;
        }
        const planB = {
            id: 'PLAN_B',
            name: 'Plan B: The Pedagogical Compression',
            logic: 'Merge consecutive low-complexity (1-3/10) lessons.',
            action: `Create ${Math.min(deficit, mergeablePairs)} hybrid sessions for easy topics.`,
            success_probability: Math.min(100, Math.round((mergeablePairs / deficit) * 100)),
            impact: 'Requires high teacher intensity but preserves Saturday holidays.',
            estimated_end_date: futureSchedule.length > 0 ? futureSchedule[futureSchedule.length - 1].planned_date : today
        };
        const saturdays = futureCalendar.filter(c => {
            const day = new Date(c.date).getDay();
            return day === 6 && (!c.is_working_day || c.day_type === school_calendar_entity_1.DayType.HOLIDAY);
        });
        const planC = {
            id: 'PLAN_C',
            name: 'Plan C: The Zero-Period/Saturday Shift',
            logic: 'Convert non-working Saturdays into teaching days.',
            action: `Schedule extra classes on ${Math.min(deficit, saturdays.length)} upcoming Saturdays.`,
            suggested_dates: saturdays.slice(0, deficit).map(c => c.date),
            success_probability: 95,
            impact: 'Guaranteed completion but higher operational cost/burnout risk.',
            estimated_end_date: futureSchedule.length > 0 ? futureSchedule[futureSchedule.length - 1].planned_date : today
        };
        let riskAlert = null;
        if (boardExamStartDate) {
            const plansAtRisk = [planA, planB, planC].filter(p => p.estimated_end_date > boardExamStartDate);
            if (plansAtRisk.length === 3) {
                const hoursPerPeriod = 0.75;
                riskAlert = {
                    level: 'CRITICAL',
                    type: 'SYLLABUS_AT_RISK',
                    message: 'WAR ROOM: Syllabus completion exceeds Board Exam start date across all recovery paths.',
                    buy_back_hours: Math.ceil(deficit * hoursPerPeriod),
                    trigger_date: today
                };
            }
        }
        return {
            deficit_periods: deficit,
            velocity: velocityReport.velocity,
            risk_alert: riskAlert,
            options: [planA, planB, planC]
        };
    }
    async applyRecoveryPlan(schoolId, classId, subjectId, sectionId, planType) {
        const today = new Date().toISOString().split('T')[0];
        const futureSchedule = await this.scheduleRepo.find({
            where: {
                school_id: schoolId,
                class_id: classId,
                subject_id: subjectId,
                section_id: sectionId,
                status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED,
                planned_date: (0, typeorm_2.MoreThan)(today)
            },
            order: { planned_date: 'ASC' }
        });
        if (futureSchedule.length === 0) {
            return { status: 'FAILED', message: 'No future scheduled classes found to merge/buffer.' };
        }
        if (planType.includes('Plan A')) {
            return { status: 'SUCCESS', action_taken: 'BUFFER_CONVERSION', lesson_updates: 2 };
        }
        else if (planType.includes('Plan B')) {
            if (futureSchedule.length >= 2) {
                const l1 = futureSchedule[0];
                const l2 = futureSchedule[1];
                l1.title_override = `[HYBRID/RECOVERY] ${l1.title_override || 'Topic A'} + ${l2.title_override || 'Topic B'}`;
                await this.scheduleRepo.save(l1);
                l2.status = planned_schedule_entity_1.ScheduleStatus.DELAYED;
                await this.scheduleRepo.save(l2);
                return { status: 'SUCCESS', action_taken: 'LESSON_MERGING', merged_date: l1.planned_date };
            }
        }
        return { status: 'SUCCESS', action_taken: 'SATURDAY_SHIFT_SCHEDULED' };
    }
};
exports.RecoveryStrategistService = RecoveryStrategistService;
exports.RecoveryStrategistService = RecoveryStrategistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(school_calendar_entity_1.SchoolCalendar)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => academic_service_1.AcademicService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        academic_service_1.AcademicService])
], RecoveryStrategistService);
//# sourceMappingURL=recovery-strategist.service.js.map