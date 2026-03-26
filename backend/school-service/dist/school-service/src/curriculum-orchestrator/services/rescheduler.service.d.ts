import { Repository } from 'typeorm';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
export declare class CurriculumReschedulerService {
    private planRepo;
    private itemRepo;
    private calendarRepo;
    private yearRepo;
    constructor(planRepo: Repository<CurriculumPlan>, itemRepo: Repository<CurriculumPlanItem>, calendarRepo: Repository<AcademicCalendarEvent>, yearRepo: Repository<AcademicYear>);
    recalculatePlan(schoolId: string, planId: string): Promise<CurriculumPlan>;
}
