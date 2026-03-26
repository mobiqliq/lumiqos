import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { SyllabusTopic } from './syllabus-topic.entity';
export declare class Syllabus {
    id: string;
    school_id: string;
    class_id: string;
    subject_id: string;
    units: number;
    estimated_days: number;
    total_topics: number;
    current_topic: string;
    school: School;
    class: Class;
    subject: Subject;
    topics: SyllabusTopic[];
    created_at: Date;
    updated_at: Date;
}
