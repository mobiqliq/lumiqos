import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { RbacGuard } from '@xceliqos/shared/index';
import { RequirePermissions } from '@xceliqos/shared/index';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('session')
    @RequirePermissions('attendance:write')
    createSession(@Body() dto: any) {
        return this.attendanceService.createSession(dto);
    }

    @Post('mark')
    @RequirePermissions('attendance:write')
    markAttendance(@Body() dto: any) {
        return this.attendanceService.markAttendance(dto.session_id, dto.records);
    }

    @Get('class')
    @RequirePermissions('attendance:read')
    getClassAttendance(@Query('class_id') classId: string, @Query('section_id') sectionId: string, @Query('date') date: string) {
        return this.attendanceService.getClassAttendance(classId, sectionId, date);
    }

    @Get('student/:student_id')
    @RequirePermissions('attendance:read')
    getStudentAttendance(@Param('student_id') studentId: string) {
        return this.attendanceService.getStudentAttendance(studentId);
    }

    @Get('analytics')
    @RequirePermissions('attendance:read')
    getAnalytics(@Query('teacher_id') teacherId: string, @Query('class_id') classId: string) {
        return this.attendanceService.getAttendanceAnalytics(teacherId, classId);
    }

    @Get('overview')
    @RequirePermissions('attendance:read')
    getOverview(@Query('school_id') schoolId: string) {
        return this.attendanceService.getSchoolOverview(schoolId);
    }
}
