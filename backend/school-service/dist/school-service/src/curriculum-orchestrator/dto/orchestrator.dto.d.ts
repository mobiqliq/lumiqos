export declare class GeneratePlanDto {
    academic_year_id: string;
    class_id: string;
    subject_id: string;
    planned_start_date?: string;
    planned_end_date?: string;
}
export declare class LogTeachingDto {
    class_id: string;
    subject_id: string;
    date: string;
    topics_covered: string[];
    actual_sessions: number;
    remarks?: string;
}
