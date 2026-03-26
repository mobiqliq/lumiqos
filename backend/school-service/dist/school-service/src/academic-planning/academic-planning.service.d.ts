import { Repository } from 'typeorm';
import { AcademicPlan } from '@lumiqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@lumiqos/shared/src/entities/academic-plan-item.entity';
import { PlanningDay } from '@lumiqos/shared/src/entities/planning-day.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { SyllabusTopic } from '@lumiqos/shared/src/entities/syllabus-topic.entity';
export declare class AcademicPlanningService {
    private planRepo;
    private itemRepo;
    private syllabusTopicRepo;
    private planningDayRepo;
    private boardConfigRepo;
    private syllabusRepo;
    private calendarEventRepo;
    private academicYearRepo;
    private curriculumPlanRepo;
    private curriculumItemRepo;
    private examRepo;
    private classRepo;
    private subjectRepo;
    constructor(planRepo: Repository<AcademicPlan>, itemRepo: Repository<AcademicPlanItem>, syllabusTopicRepo: Repository<SyllabusTopic>, planningDayRepo: Repository<PlanningDay>, boardConfigRepo: Repository<Board>, syllabusRepo: Repository<Syllabus>, calendarEventRepo: Repository<AcademicCalendarEvent>, academicYearRepo: Repository<AcademicYear>, curriculumPlanRepo: Repository<CurriculumPlan>, curriculumItemRepo: Repository<CurriculumPlanItem>, examRepo: Repository<Exam>, classRepo: Repository<Class>, subjectRepo: Repository<Subject>);
    syncCalendar(schoolId: string, academicYearId: string): Promise<{
        message: string;
        count: number;
    }>;
    generatePlan(schoolId: string, academicYearId: string, classId: string, subjectId: string, disruptionMode?: boolean): Promise<{
        plan_id: string;
        feasibility_status: string;
        message: string;
        total_remaining?: undefined;
        available_days?: undefined;
    } | {
        plan_id: string;
        total_remaining: number;
        available_days: number;
        feasibility_status: string;
        message: string;
    } | {
        plan_id: string;
        total_topics: number;
        total_days: number;
        completion_date: null;
        feasibility_status: string;
    } | {
        plan_id: string;
        total_topics: number;
        total_days: number;
        completion_date: string;
        feasibility_status: string;
    }>;
    getPlan(planId: string): Promise<{
        plan: AcademicPlan;
        items: AcademicPlanItem[];
    }>;
    approvePlan(planId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getLatestPlanStatus(schoolId: string, academicYearId: string, classId: string, subjectId: string): Promise<{
        status: string;
        plan_id?: undefined;
        version?: undefined;
        is_baseline?: undefined;
        message?: undefined;
    } | {
        status: string;
        plan_id: string;
        version: number;
        is_baseline: boolean;
        message?: undefined;
    } | {
        status: string;
        message: any;
        plan_id?: undefined;
        version?: undefined;
        is_baseline?: undefined;
    }>;
    getPlanPreview(planId: string): Promise<{
        plan_id: string;
        status: string;
        is_baseline: boolean;
        total_topics: number;
        allocated_topics: number;
        monthly_distribution_full_year: {
            month: string;
            topic_count: number;
        }[];
        buffer_days: number;
        buffer_status: string;
        topics_per_week: number;
        pacing: string;
        expected_topics_by_today: number;
        completed_topics: number;
    }>;
    updatePlanItems(planId: string, updates: {
        id: string;
        planned_date: string;
    }[]): Promise<{
        success: boolean;
    }>;
    getAcademicHealthSummary(schoolId: string, academicYearId: string): Promise<any>;
    getDailyInsights(schoolId: string, academicYearId: string): Promise<any[]>;
    private generateAdjustedPlan;
}
