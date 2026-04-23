import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumPlan } from '@xceliqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';

@Injectable()
export class CurriculumReschedulerService {
    constructor(
        @InjectRepository(CurriculumPlan)
        private planRepo: Repository<CurriculumPlan>,
        @InjectRepository(CurriculumPlanItem)
        private itemRepo: Repository<CurriculumPlanItem>,
        @InjectRepository(AcademicCalendarEvent)
        private calendarRepo: Repository<AcademicCalendarEvent>,
        @InjectRepository(AcademicYear)
        private yearRepo: Repository<AcademicYear>,
    ) {}

    async recalculatePlan(schoolId: string, planId: string) {
        const plan = await this.planRepo.findOne({ where: { id: planId, school_id: schoolId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const today = new Date().toISOString().split('T')[0];

        // 1. Identify "Lost" Items: Pending items
        const pendingItems = await this.itemRepo.find({
            where: { plan_id: plan.id, status: 'pending' },
            order: { planned_date: 'ASC' }
        });

        if (pendingItems.length === 0) return plan;

        // 2. Identify Future Teaching Days (Deterministic: No Sundays)
        const year = await this.yearRepo.findOne({ where: { id: plan.academic_year_id } });
        
        const futureTeachingDays: string[] = [];
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

        if (futureTeachingDays.length === 0) return plan;

        // 3. Redistribute Pending Items to Future Days
        for (let i = 0; i < pendingItems.length; i++) {
            const dayIndex = i % futureTeachingDays.length;
            pendingItems[i].planned_date = futureTeachingDays[dayIndex];
            await this.itemRepo.save(pendingItems[i]);
        }

        return this.planRepo.save(plan);
    }
}
