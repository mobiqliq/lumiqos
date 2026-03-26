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
exports.CurriculumPlannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const curriculum_plan_entity_1 = require("../../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../../shared/src/entities/curriculum-plan-item.entity");
const syllabus_entity_1 = require("../../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../../shared/src/entities/academic-calendar-event.entity");
const academic_year_entity_1 = require("../../../../shared/src/entities/academic-year.entity");
let CurriculumPlannerService = class CurriculumPlannerService {
    planRepo;
    itemRepo;
    syllabusRepo;
    calendarRepo;
    yearRepo;
    constructor(planRepo, itemRepo, syllabusRepo, calendarRepo, yearRepo) {
        this.planRepo = planRepo;
        this.itemRepo = itemRepo;
        this.syllabusRepo = syllabusRepo;
        this.calendarRepo = calendarRepo;
        this.yearRepo = yearRepo;
    }
    async generatePlan(schoolId, dto) {
        const { academic_year_id, class_id, subject_id, planned_start_date, planned_end_date } = dto;
        const year = await this.yearRepo.findOne({ where: { id: academic_year_id, school_id: schoolId } });
        if (!year)
            throw new common_1.NotFoundException('Academic Year not found');
        const syllabusEntries = await this.syllabusRepo.find({
            where: { school_id: schoolId, class_id, subject_id }
        });
        if (syllabusEntries.length === 0)
            throw new common_1.BadRequestException('Syllabus is empty for this class/subject');
        const start = planned_start_date ? new Date(planned_start_date) : new Date(year.start_date);
        const end = planned_end_date ? new Date(planned_end_date) : new Date(year.end_date);
        const teachingDays = [];
        let curr = new Date(start);
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            const isSunday = curr.getDay() === 0;
            if (!isSunday) {
                teachingDays.push(dateStr);
            }
            curr.setDate(curr.getDate() + 1);
        }
        if (teachingDays.length === 0)
            throw new common_1.BadRequestException('Zero teaching days available');
        const plan = this.planRepo.create({
            school_id: schoolId,
            academic_year_id,
            class_id,
            subject_id,
            planned_start_date: start.toISOString().split('T')[0],
            planned_end_date: end.toISOString().split('T')[0],
            total_topics: syllabusEntries.length,
            total_estimated_hours: syllabusEntries.reduce((acc, s) => acc + (s.units || 1), 0),
            status: 'active'
        });
        const savedPlan = await this.planRepo.save(plan);
        const items = [];
        for (let i = 0; i < syllabusEntries.length; i++) {
            const dayIndex = i % teachingDays.length;
            const planned_date = teachingDays[dayIndex];
            items.push(this.itemRepo.create({
                plan_id: savedPlan.id,
                topic_id: syllabusEntries[i].id,
                planned_date,
                planned_sessions: 1,
                status: 'pending'
            }));
        }
        await this.itemRepo.save(items);
        return { ...savedPlan, items };
    }
    async getPlan(schoolId, planId) {
        const plan = await this.planRepo.findOne({
            where: { id: planId, school_id: schoolId },
            relations: ['items', 'items.syllabus']
        });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const today = new Date().toISOString().split('T')[0];
        const enrichedItems = plan.items.map(item => ({
            ...item,
            status: (item.status === 'pending' && item.planned_date < today) ? 'MISSED' : item.status
        }));
        const completed = enrichedItems.filter(i => i.status === 'completed').length;
        const progress = enrichedItems.length > 0 ? (completed / enrichedItems.length) * 100 : 0;
        return { ...plan, items: enrichedItems, progress: Math.round(progress) };
    }
    async getPlansForClass(schoolId, academicYearId, classId) {
        return this.planRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, status: 'active' },
            relations: ['subject']
        });
    }
};
exports.CurriculumPlannerService = CurriculumPlannerService;
exports.CurriculumPlannerService = CurriculumPlannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(curriculum_plan_entity_1.CurriculumPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(curriculum_plan_item_entity_1.CurriculumPlanItem)),
    __param(2, (0, typeorm_1.InjectRepository)(syllabus_entity_1.Syllabus)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_calendar_event_entity_1.AcademicCalendarEvent)),
    __param(4, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CurriculumPlannerService);
//# sourceMappingURL=planner.service.js.map