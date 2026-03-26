import { School } from './school.entity';
import { User } from './user.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
export declare class TeachingLog {
    id: string;
    school_id: string;
    teacher_id: string;
    class_id: string;
    subject_id: string;
    date: string;
    topics_covered: any;
    actual_sessions: number;
    remarks: string;
    school: School;
    teacher: User;
    class: Class;
    subject: Subject;
    created_at: Date;
    updated_at: Date;
}
