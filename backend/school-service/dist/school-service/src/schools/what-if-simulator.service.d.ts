import { Repository } from 'typeorm';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
export declare class WhatIfSimulatorService {
    private readonly scheduleRepo;
    private readonly classRepo;
    private readonly subjectRepo;
    private readonly logger;
    constructor(scheduleRepo: Repository<PlannedSchedule>, classRepo: Repository<Class>, subjectRepo: Repository<Subject>);
    simulateCalendarLoss(schoolId: string, yearId: string, startDate: string, endDate: string, eventName: string): Promise<{
        event: string;
        status: string;
        message: string;
        casualty_report: never[];
        simulated_dates?: undefined;
        total_affected_periods?: undefined;
        overall_status?: undefined;
    } | {
        event: string;
        simulated_dates: string;
        total_affected_periods: number;
        overall_status: string;
        casualty_report: {
            class_name: string;
            subject_name: string;
            lost_periods: number;
            original_end_date: string;
            projected_end_date: string;
            board_exam_date: string;
            status: string;
            warning: string;
        }[];
        status?: undefined;
        message?: undefined;
    }>;
}
