import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
export declare class LessonPlan {
    id: string;
    school_id: string;
    class_id: string;
    subject_id: string;
    teacher_id: string;
    topic: string;
    duration: string;
    plan_data: any;
    school: School;
    class: Class;
    subject: Subject;
    teacher: User;
    created_at: Date;
    updated_at: Date;
}
