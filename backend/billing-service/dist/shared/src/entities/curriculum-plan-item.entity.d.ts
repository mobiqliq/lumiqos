import { CurriculumPlan } from './curriculum-plan.entity';
import { Syllabus } from './syllabus.entity';
export declare class CurriculumPlanItem {
    id: string;
    plan_id: string;
    topic_id: string;
    planned_date: string;
    planned_sessions: number;
    status: string;
    plan: CurriculumPlan;
    syllabus: Syllabus;
    created_at: Date;
    updated_at: Date;
}
