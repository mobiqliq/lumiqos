import { AcademicPlan } from './academic-plan.entity';
export declare class PlanningCalendar {
    id: string;
    plan_id: string;
    date: string;
    type: string;
    metadata: any;
    plan: AcademicPlan;
    created_at: Date;
    updated_at: Date;
}
