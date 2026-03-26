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
exports.CurriculumReschedulerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const curriculum_plan_entity_1 = require("../../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../../shared/src/entities/curriculum-plan-item.entity");
const academic_calendar_event_entity_1 = require("../../../../shared/src/entities/academic-calendar-event.entity");
const academic_year_entity_1 = require("../../../../shared/src/entities/academic-year.entity");
let CurriculumReschedulerService = class CurriculumReschedulerService {
    planRepo;
    itemRepo;
    calendarRepo;
    yearRepo;
    constructor(planRepo, itemRepo, calendarRepo, yearRepo) {
        this.planRepo = planRepo;
        this.itemRepo = itemRepo;
        this.calendarRepo = calendarRepo;
        this.yearRepo = yearRepo;
    }
    async recalculatePlan(schoolId, planId) {
        const plan = await this.planRepo.findOne({ where: { id: planId, school_id: schoolId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const today = new Date().toISOString().split('T')[0];
        const pendingItems = await this.itemRepo.find({
            where: { plan_id: plan.id, status: 'pending' },
            order: { planned_date: 'ASC' }
        });
        if (pendingItems.length === 0)
            return plan;
        const year = await this.yearRepo.findOne({ where: { id: plan.academic_year_id } });
        const futureTeachingDays = [];
        let curr = new Date(today);
        const end = new Date(year?.end_date || plan.planned_end_date);
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            const isSunday = curr.getDay() === 0;
            if (!isSunday) {
                futureTeachingDays.push(dateStr);
            }
            curr.setDate(curr.getDate() + 1);
        }
        if (futureTeachingDays.length === 0)
            return plan;
        for (let i = 0; i < pendingItems.length; i++) {
            const dayIndex = i % futureTeachingDays.length;
            pendingItems[i].planned_date = futureTeachingDays[dayIndex];
            await this.itemRepo.save(pendingItems[i]);
        }
        return this.planRepo.save(plan);
    }
};
exports.CurriculumReschedulerService = CurriculumReschedulerService;
exports.CurriculumReschedulerService = CurriculumReschedulerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(curriculum_plan_entity_1.CurriculumPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(curriculum_plan_item_entity_1.CurriculumPlanItem)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_calendar_event_entity_1.AcademicCalendarEvent)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CurriculumReschedulerService);
//# sourceMappingURL=rescheduler.service.js.map