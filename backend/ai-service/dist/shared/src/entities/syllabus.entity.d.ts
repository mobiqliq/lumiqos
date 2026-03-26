import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
export declare class Syllabus {
    id: string;
    school_id: string;
    class_id: string;
    subject_id: string;
    units: number;
    estimated_days: number;
    current_topic: string;
    school: School;
    class: Class;
    subject: Subject;
    created_at: Date;
    updated_at: Date;
}
