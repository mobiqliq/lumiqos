import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CommandCenterService } from './command-center.service';
import { JwtAuthGuard, RbacGuard, RequireRoles, TenantContext } from '@lumiqos/shared/index';

@Controller('ai/command-center')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequireRoles('school_owner', 'principal') // Strictly executive routing
export class CommandCenterController {
    constructor(private readonly ccService: CommandCenterService) { }

    @Get()
    getCommandCenterSummary(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getCommandCenterSummary(schoolId);
    }

    @Get('enrollment-forecast')
    getEnrollmentForecast(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getEnrollmentForecast(schoolId);
    }

    @Get('financial-forecast')
    getFinancialForecast(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getFinancialForecast(schoolId);
    }

    @Get('teacher-workload')
    getTeacherWorkload(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getTeacherWorkload(schoolId);
    }

    @Get('student-interventions')
    getStudentInterventions(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getStudentInterventions(schoolId);
    }

    @Get('weekly-summary')
    getWeeklySummary(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.ccService.getWeeklySummary(schoolId);
    }
}
