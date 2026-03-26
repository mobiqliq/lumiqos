import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { CurriculumUnit } from './curriculum-unit.entity';
export declare class LessonPlan {
    id: string;
    school_id: string;
    class_id: string;
    subject_id: string;
    teacher_id: string;
    title: string;
    learning_outcome: string;
    estimated_minutes: number;
    complexity_index: number;
    unit_id: string;
    unit: CurriculumUnit;
    plan_data: any;
    tags: string[];
    school: School;
    class: Class;
    subject: Subject;
    teacher: User;
    created_at: Date;
    updated_at: Date;
}
