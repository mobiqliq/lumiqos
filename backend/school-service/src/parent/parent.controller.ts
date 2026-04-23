import { Controller, Get, Post, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ParentService } from './parent.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { RbacGuard } from '@xceliqos/shared/index';
import { RequireRoles } from '@xceliqos/shared/index';
import { TenantContext } from '@xceliqos/shared/index';

@Controller('parent')
export class ParentController {
    constructor(private readonly parentService: ParentService) { }

    @Get('summary/:student_id')
    getStudentSummary(@Param('student_id') studentId: string, @Req() req: any) {
        const schoolId = req.headers['x-school-id'] || TenantContext.getStore()?.schoolId;
        return this.parentService.getStudentSummary(studentId, schoolId);
    }

    @Get('dashboard/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getDashboard(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getDashboard(req.user.user_id, studentId);
    }

    @Get('attendance/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getAttendance(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getAttendanceHistory(req.user.user_id, studentId);
    }

    @Get('homework/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getHomework(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getHomework(req.user.user_id, studentId);
    }

    @Get('report-cards/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getReportCards(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getReportCards(req.user.user_id, studentId);
    }

    @Get('fees/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getFees(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getFees(req.user.user_id, studentId);
    }

    @Get('notifications')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getNotifications(@Req() req: any, @Query('limit') limit = 20, @Query('offset') offset = 0) {
        return this.parentService.getNotifications(req.user.user_id, limit, offset);
    }

    @Get('messages/:student_id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('parent')
    getMessages(@Req() req: any, @Param('student_id') studentId: string) {
        return this.parentService.getMessages(req.user.user_id, studentId);
    }
}
