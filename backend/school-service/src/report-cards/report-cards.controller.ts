import { Controller, Post, Get, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ReportCardsService } from './report-cards.service';
import { RequirePermissions } from '@xceliqos/shared/index';

@Controller('report-cards')
export class ReportCardsController {
    constructor(private readonly reportCardsService: ReportCardsService) { }

    @Post('generate')
    @RequirePermissions('reports:write')
    generateReportCards(@Body() dto: { exam_id: string; class_id: string; section_id?: string; force?: boolean }) {
        if (!dto.exam_id || !dto.class_id) {
            throw new BadRequestException('exam_id and class_id are required');
        }
        return this.reportCardsService.generateReportCards(dto.exam_id, dto.class_id, dto.section_id, !!dto.force);
    }

    @Get('class')
    @RequirePermissions('reports:read')
    getClassReportCards(
        @Query('exam_id') examId: string,
        @Query('class_id') classId: string,
        @Query('section_id') sectionId: string
    ) {
        if (!examId || !classId) {
            throw new BadRequestException('exam_id and class_id are required');
        }
        return this.reportCardsService.getClassReportCards(examId, classId, sectionId);
    }

    @Get('student/:student_id')
    @RequirePermissions('reports:read')
    getStudentReportCards(@Param('student_id') studentId: string) {
        return this.reportCardsService.getStudentReportCards(studentId);
    }
}
