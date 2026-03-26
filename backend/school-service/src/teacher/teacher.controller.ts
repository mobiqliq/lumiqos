import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequireRoles } from '@lumiqos/shared/index';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequireRoles('teacher')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService) { }

    @Get('dashboard')
    getDashboard(@Req() req: any) {
        return this.teacherService.getDashboard(req.user.user_id);
    }

    @Get('classes')
    getClasses(@Req() req: any) {
        return this.teacherService.getClasses(req.user.user_id);
    }

    @Post('attendance/quick')
    quickAttendance(@Req() req: any, @Body() body: any) {
        return this.teacherService.submitQuickAttendance(req.user.user_id, body);
    }

    @Post('homework/quick')
    quickHomework(@Req() req: any, @Body() body: any) {
        return this.teacherService.assignQuickHomework(req.user.user_id, body);
    }

    @Get('homework/submissions')
    getHomeworkSubmissions(@Req() req: any, @Query('limit') limit = 25, @Query('offset') offset = 0) {
        return this.teacherService.getHomeworkSubmissions(req.user.user_id, limit, offset);
    }

    @Post('grade')
    quickGrade(@Req() req: any, @Body() body: any) {
        return this.teacherService.submitGrade(req.user.user_id, body);
    }

    @Get('messages')
    @UseGuards(JwtAuthGuard, RbacGuard)
    getMessages(@Req() req: any) {
        return this.teacherService.getMessages(req.user.user_id);
    }

    @MessagePattern({ cmd: 'get_teachers' })
    async getTeachersList(@Payload() data: { schoolId: string }) {
        return this.teacherService.getTeachers(data.schoolId);
    }

    @MessagePattern({ cmd: 'get_teacher_dashboard' })
    async getTeacherDashboard(@Payload() data: { schoolId: string, userId: string }) {
        return this.teacherService.getDashboard(data.userId); // schoolId ignored for now as user_id is unique
    }
}
