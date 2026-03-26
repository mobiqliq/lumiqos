import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { CurriculumPlanItem } from './curriculum-plan-item.entity';
export declare class CurriculumPlan {
    id: string;
    school_id: string;
    academic_year_id: string;
    class_id: string;
    subject_id: string;
    total_topics: number;
    total_estimated_hours: number;
    planned_start_date: string;
    planned_end_date: string;
    status: string;
    school: School;
    academicYear: AcademicYear;
    class: Class;
    subject: Subject;
    items: CurriculumPlanItem[];
    created_at: Date;
    updated_at: Date;
}
