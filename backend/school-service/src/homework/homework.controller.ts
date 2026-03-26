import { Controller, Post, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';

@Controller('homework')
@UseGuards(JwtAuthGuard, RbacGuard)
export class HomeworkController {
    constructor(private readonly homeworkService: HomeworkService) { }

    @Post()
    @RequirePermissions('homework:write')
    createHomework(@Body() dto: any) {
        return this.homeworkService.createHomework(dto);
    }

    @Put(':id')
    @RequirePermissions('homework:write')
    updateHomework(@Param('id') id: string, @Body() dto: any) {
        return this.homeworkService.updateHomework(id, dto);
    }

    @Get('class')
    @RequirePermissions('homework:read')
    getHomeworkForClass(@Query('class_id') classId: string, @Query('section_id') sectionId: string) {
        return this.homeworkService.getHomeworkForClass(classId, sectionId);
    }

    @Post('submit')
    @RequirePermissions('homework:submit')
    submitHomework(@Body() dto: any) {
        return this.homeworkService.submitHomework(dto);
    }

    @Put('grade')
    @RequirePermissions('homework:grade')
    gradeHomework(@Body() dto: any) {
        return this.homeworkService.gradeHomework(dto.submission_id, dto.grade, dto.teacher_feedback);
    }

    @Get('completion')
    @RequirePermissions('homework:read')
    getCompletionMetrics(@Query('homework_id') homeworkId: string) {
        return this.homeworkService.getCompletionMetrics(homeworkId);
    }
}
