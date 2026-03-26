import { Repository } from 'typeorm';
import { PlannedSchedule } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { SchoolCalendar } from '@lumiqos/shared/src/entities/school-calendar.entity';
import { AcademicService } from './academic.service';
export declare class RecoveryStrategistService {
    private readonly scheduleRepo;
    private readonly calendarRepo;
    private readonly academicService;
    constructor(scheduleRepo: Repository<PlannedSchedule>, calendarRepo: Repository<SchoolCalendar>, academicService: AcademicService);
    generateRecoveryPlans(schoolId: string, classId: string, subjectId: string, boardExamStartDate?: string): Promise<{
        message: string;
        velocity: number;
        deficit_periods?: undefined;
        risk_alert?: undefined;
        options?: undefined;
    } | {
        deficit_periods: number;
        velocity: number;
        risk_alert: {
            level: string;
            type: string;
            message: string;
            buy_back_hours: number;
            trigger_date: string;
        } | null;
        options: {
            id: string;
            name: string;
            logic: string;
            action: string;
            success_probability: number;
            impact: string;
            estimated_end_date: string;
        }[];
        message?: undefined;
    }>;
    applyRecoveryPlan(schoolId: string, classId: string, subjectId: string, sectionId: string, planType: string): Promise<{
        status: string;
        message: string;
        action_taken?: undefined;
        lesson_updates?: undefined;
        merged_date?: undefined;
    } | {
        status: string;
        action_taken: string;
        lesson_updates: number;
        message?: undefined;
        merged_date?: undefined;
    } | {
        status: string;
        action_taken: string;
        merged_date: string;
        message?: undefined;
        lesson_updates?: undefined;
    } | {
        status: string;
        action_taken: string;
        message?: undefined;
        lesson_updates?: undefined;
        merged_date?: undefined;
    }>;
}
