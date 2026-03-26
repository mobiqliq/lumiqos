import { Repository } from 'typeorm';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { TeachingLog } from '@lumiqos/shared/src/entities/teaching-log.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { LogTeachingDto } from '../dto/orchestrator.dto';
export declare class CurriculumTrackingService {
    private planRepo;
    private itemRepo;
    private logRepo;
    private yearRepo;
    private calendarRepo;
    private subjectRepo;
    constructor(planRepo: Repository<CurriculumPlan>, itemRepo: Repository<CurriculumPlanItem>, logRepo: Repository<TeachingLog>, yearRepo: Repository<AcademicYear>, calendarRepo: Repository<AcademicCalendarEvent>, subjectRepo: Repository<Subject>);
    logTeaching(schoolId: string, teacherId: string, dto: LogTeachingDto): Promise<TeachingLog>;
    getCurriculumSummary(schoolId: string, academicYearId: string, classId: string, subjectId: string): Promise<{
        plan_id: string;
        subject_id: string;
        completion_percentage: number;
        total_topics: number;
        completed_topics: number;
        delayed_topics: number;
        delay_days: number;
        remaining_topics: number;
        remaining_days: number;
        risk_status: string;
        next_scheduled_date: string | null;
    } | null>;
}
