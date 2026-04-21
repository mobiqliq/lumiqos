import { Controller, Post, Get, Put, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { RequirePermissions } from '@lumiqos/shared/index';

@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post('types')
    @RequirePermissions('exams:write')
    createExamType(@Body() dto: any) {
        return this.examsService.createExamType(dto);
    }

    @Get('types')
    @RequirePermissions('exams:read')
    getExamTypes() {
        return this.examsService.getExamTypes();
    }

    @Post()
    @RequirePermissions('exams:write')
    createExam(@Body() dto: any) {
        return this.examsService.createExam(dto);
    }

    @Get()
    @RequirePermissions('exams:read')
    getExams() {
        return this.examsService.getExams();
    }

    @Post('subjects')
    @RequirePermissions('exams:write')
    assignSubject(@Body() dto: any) {
        return this.examsService.assignSubject(dto);
    }

    @Post('marks')
    @RequirePermissions('marks:write')
    enterBulkMarks(@Body() dto: any) {
        if (!dto.exam_subject_id || !Array.isArray(dto.records)) {
            throw new BadRequestException('Invalid payload. Expected exam_subject_id and an array of records.');
        }
        return this.examsService.enterBulkMarks(dto.exam_subject_id, dto.records);
    }

    @Get('results')
    @RequirePermissions('exams:read')
    getResults(@Query('exam_id') examId: string, @Query('class_id') classId: string, @Query('section_id') sectionId: string) {
        return this.examsService.getResults(examId, classId, sectionId);
    }

    @Get('student/:student_id')
    @RequirePermissions('exams:read')
    getStudentHistory(@Param('student_id') studentId: string) {
        return this.examsService.getStudentHistory(studentId);
    }

    @Post('grade-scales')
    @RequirePermissions('exams:write')
    createGradeScale(@Body() dto: any) {
        return this.examsService.createGradeScale(dto);
    }

    // --- AI Exam Generation ---
    @Post('generate')
    @RequirePermissions('exams:write')
    generateExam(@Body() dto: { board: string, subject: string, classLevel: string, type: string }) {
        return this.examsService.generateExam(dto.board, dto.subject, dto.classLevel, dto.type);
    }
}
