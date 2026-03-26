import { School } from './school.entity';
export declare class TimeSlot {
    id: string;
    school_id: string;
    name: string;
    start_time: string;
    end_time: string;
    school: School;
    created_at: Date;
    updated_at: Date;
}
