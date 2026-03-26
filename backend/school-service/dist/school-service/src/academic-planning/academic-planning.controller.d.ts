import { AcademicPlanningService } from './academic-planning.service';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { ApprovePlanDto } from './dto/approve-plan.dto';
export declare class AcademicPlanningController {
    private readonly planningService;
    constructor(planningService: AcademicPlanningService);
    generatePlan(dto: GeneratePlanDto): Promise<{
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
    approvePlan(dto: ApprovePlanDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPlanStatus(schoolId: string, academicYearId: string, classId: string, subjectId: string): Promise<{
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
    getAcademicHealthSummary(schoolId: string, academicYearId: string): Promise<any>;
    getDailyInsights(schoolId: string, academicYearId: string): Promise<any[]>;
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
    getPlan(planId: string): Promise<{
        plan: import("@lumiqos/shared/index").AcademicPlan;
        items: import("@lumiqos/shared/index").AcademicPlanItem[];
    }>;
}
