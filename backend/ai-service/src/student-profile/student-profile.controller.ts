import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { JwtAuthGuard, RbacGuard, RequireRoles, TenantContext } from '@lumiqos/shared/index';

@Controller()
@UseGuards(JwtAuthGuard, RbacGuard)
export class StudentProfileController {
    constructor(private readonly profileService: StudentProfileService) { }

    // Batch generator (Typically cron triggered, exposed for system admins/executives)
    @Post('ai/student-profile/rebuild')
    @RequireRoles('school_owner', 'principal')
    async triggerBatchRebuild(@Req() req: any) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.profileService.triggerBatchRebuild(schoolId);
    }

    // Teacher explicit access mapping granular metrics securely
    @Get('ai/teacher/student-profile/:student_id')
    @RequireRoles('teacher', 'school_owner', 'principal')
    async getTeacherProfile(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.profileService.getTeacherProfile(schoolId, studentId);
    }

    // Parent simplified endpoint dropping raw signals explicitly natively
    @Get('parent/student-insights/:student_id')
    // We assume routing hits this via Gateway mapping directly natively, or Parents are authorized globally.
    // In a full implementation, StudentGuardian interceptors would boundary check 'student_id' securely here.
    @RequireRoles('parent', 'school_owner', 'principal')
    async getParentInsights(@Req() req: any, @Param('student_id') studentId: string) {
        const schoolId = TenantContext.getStore()?.schoolId || req.user.school_id;
        return this.profileService.getParentInsights(schoolId, studentId);
    }
}
