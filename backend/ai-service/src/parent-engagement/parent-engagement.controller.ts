import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ParentEngagementService } from './parent-engagement.service';
import { JwtAuthGuard, RbacGuard, RequireRoles, TenantContext } from '@lumiqos/shared/index';

@Controller('ai/parent')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ParentEngagementController {
    constructor(private readonly engagementService: ParentEngagementService) { }

    @Get('daily-digest/:student_id')
    @RequireRoles('parent')
    async getDailyDigest(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.generateDailyDigest(req.user.user_id, schoolId, studentId);
    }

    @Get('learning-timeline/:student_id')
    @RequireRoles('parent')
    async getLearningTimeline(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getLearningTimeline(req.user.user_id, schoolId, studentId);
    }

    @Get('fee-insight/:student_id')
    @RequireRoles('parent')
    async getFeeInsight(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getFeeInsight(req.user.user_id, schoolId, studentId);
    }

    @Get('ptm-prep/:student_id')
    @RequireRoles('parent')
    async getPtmPrep(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getPtmPrep(req.user.user_id, schoolId, studentId);
    }

    @Get('learning-recommendations/:student_id')
    @RequireRoles('parent')
    async getLearningRecommendations(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.engagementService.getLearningRecommendations(req.user.user_id, schoolId, studentId);
    }

    // Cron Trigger (Allowed for System/Admin contexts usually natively securely cleanly)
    @Post('weekly-report')
    @RequireRoles('school_admin', 'school_owner', 'principal')
    async triggerWeeklyReport() {
        return this.engagementService.triggerWeeklyReport();
    }
}
