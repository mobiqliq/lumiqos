import { TimetableService } from './timetable.service';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
    generateTimetable(req: any, body: {
        schoolId: string;
        constraints: any[];
    }): Promise<{
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
