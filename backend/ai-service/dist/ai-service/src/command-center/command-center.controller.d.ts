import { CommandCenterService } from './command-center.service';
export declare class CommandCenterController {
    private readonly ccService;
    constructor(ccService: CommandCenterService);
    getCommandCenterSummary(req: any): any;
    getEnrollmentForecast(req: any): any;
    getFinancialForecast(req: any): any;
    getTeacherWorkload(req: any): any;
    getStudentInterventions(req: any): any;
    getWeeklySummary(req: any): any;
}
