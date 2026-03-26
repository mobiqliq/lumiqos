import { School } from './school.entity';
import { Subject } from './subject.entity';
import { LessonPlan } from './lesson-plan.entity';
export declare class CurriculumUnit {
    id: string;
    school_id: string;
    subject_id: string;
    title: string;
    weightage: number;
    sequence_order: number;
    school: School;
    subject: Subject;
    lessons: LessonPlan[];
    created_at: Date;
    updated_at: Date;
}
