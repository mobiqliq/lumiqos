import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CurriculumService } from './curriculum.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';

@Controller('curriculum')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
    constructor(private readonly curriculumService: CurriculumService) { }

    @Get('syllabus/:schoolId/:classId')
    async getSyllabus(@Param('schoolId') schoolId: string, @Param('classId') classId: string) {
        return this.curriculumService.getSyllabus(schoolId, classId);
    }

    @Get('calendar/:schoolId/:academicYearId')
    async getCalendar(@Param('schoolId') schoolId: string, @Param('academicYearId') academicYearId: string) {
        return this.curriculumService.getCalendar(schoolId, academicYearId);
    }

    @Post('calendar/simulate')
    async simulateDisruption(@Body() body: { schoolId: string, lostDays: number, reason: string }) {
        return this.curriculumService.simulateDisruption(body.schoolId, body.lostDays, body.reason);
    }

    @Get('calendar-summary')
    async getCalendarSummaryHttp(@Query('schoolId') schoolId: string, @Query('month') month: string, @Query('year') year: string) {
        return this.curriculumService.getCalendarSummary(schoolId, month, parseInt(year));
    }

    @Get('daily-drilldown')
    async getDailyMappingHttp(@Query('schoolId') schoolId: string, @Query('date') date: string) {
        return this.curriculumService.getDailyMapping(schoolId, date);
    }

    // Microservice Handlers (TCP)
    @MessagePattern({ cmd: 'get_calendar_summary' })
    async getCalendarSummary(data: any) {
        return this.curriculumService.getCalendarSummary(data.schoolId, data.month, data.year);
    }

    @MessagePattern({ cmd: 'get_daily_mapping' })
    async getDailyMapping(data: any) {
        return this.curriculumService.getDailyMapping(data.schoolId, data.date);
    }

    @Post('generate-lesson-plan')
    async generateLessonPlan(@Body() body: any, @Req() req: any) {
        const { classId, subjectId, topic } = body;
        const teacherId = req.user?.id || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.generateLessonPlan(schoolId, classId, subjectId, teacherId, topic);
    }

    @MessagePattern({ cmd: 'generate_lesson_plan' })
    async generateLessonPlanTcp(data: any) {
        return this.curriculumService.generateLessonPlan(
            data.schoolId,
            data.classId,
            data.subjectId,
            data.teacherId,
            data.topic
        );
    }

    @Get('teacher/assignments')
    async getTeacherAssignments(@Req() req: any, @Param('teacherId') tId?: string) {
        // Fallback for demo mode: if JWT doesn't populate req.user, use query param or default
        const teacherId = req.user?.id || tId || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        return this.curriculumService.getTeacherAssignments(teacherId);
    }

    @Get('syllabus/recommendations/:classId/:subjectId')
    async getSyllabusRecommendations(
        @Param('classId') classId: string,
        @Param('subjectId') subjectId: string,
        @Req() req: any
    ) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.getSyllabusRecommendations(schoolId, classId, subjectId);
    }

    @Post('execute/:id')
    async executeLesson(@Param('id') id: string, @Body() body: { topic?: string, lessonPlanId?: string }) {
        return this.curriculumService.executeLesson(id, body.topic, body.lessonPlanId);
    }

    @Get('parent/insights/:studentId')
    async getParentInsights(@Param('studentId') studentId: string) {
        return this.curriculumService.getParentInsights(studentId);
    }

    @Post('generate-academic-plan')
    async generateAcademicPlan(@Req() req: any) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.curriculumService.generateAcademicPlan(schoolId);
    }
}
