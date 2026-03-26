import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { LessonPlan } from './lesson-plan.entity';
export declare class CurriculumMapping {
    id: string;
    school_id: string;
    class_id: string;
    subject_id: string;
    teacher_id: string;
    lesson_plan_id: string;
    mapping_date: string;
    topic: string;
    unit_number: number;
    status: string;
    school: School;
    class: Class;
    subject: Subject;
    teacher: User;
    lessonPlan: LessonPlan;
    created_at: Date;
    updated_at: Date;
}
