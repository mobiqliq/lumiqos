import { AiService } from '../ai/ai.service';
export declare class TimetableService {
    private aiService;
    private readonly logger;
    constructor(aiService: AiService);
    generateTimetable(schoolId: string, constraints: any[]): Promise<{
        status: string;
        message: string;
        grid_data: {
            Monday: {
                period: number;
                class: string;
                subject: string;
                teacher: string;
                category: string;
            }[];
            Tuesday: {
                period: number;
                class: string;
                subject: string;
                teacher: string;
                category: string;
            }[];
        };
    }>;
}
