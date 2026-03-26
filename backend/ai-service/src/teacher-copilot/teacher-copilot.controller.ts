import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TeacherCopilotService } from './teacher-copilot.service';
import { JwtAuthGuard, RbacGuard, RequireRoles, TenantContext } from '@lumiqos/shared/index';

@Controller('ai/teacher-copilot')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequireRoles('teacher', 'school_admin', 'principal') // Explicit rejection for parent/student
export class TeacherCopilotController {
    constructor(private readonly copilotService: TeacherCopilotService) { }

    @Post('lesson-plan')
    async generateLessonPlan(@Req() req: any, @Body() body: any) {
        return this.copilotService.generateLessonPlan(req.user.user_id, body);
    }

    @Get('class-insights')
    async getClassInsights(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.getClassInsights(schoolId);
    }

    @Post('homework-generate')
    async generateHomework(@Req() req: any, @Body() body: any) {
        return this.copilotService.generateHomework(req.user.user_id, body);
    }

    @Post('homework-differentiated')
    async generateDifferentiatedHomework(@Req() req: any, @Body() body: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.generateDifferentiatedHomework(req.user.user_id, schoolId, body);
    }

    @Post('report-comments')
    async generateReportComment(@Req() req: any, @Body() body: any) {
        return this.copilotService.generateReportComment(req.user.user_id, body);
    }

    @Get('ptm-summary/:student_id')
    async getPTMSummary(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.copilotService.getPTMSummary(schoolId, studentId);
    }
}
