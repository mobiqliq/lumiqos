import { Syllabus } from './syllabus.entity';
export declare class SyllabusTopic {
    id: string;
    syllabus_id: string;
    topic_name: string;
    sequence: number;
    syllabus: Syllabus;
    created_at: Date;
    updated_at: Date;
}
