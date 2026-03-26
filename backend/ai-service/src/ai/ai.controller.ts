import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard, RbacGuard, RequireRoles } from '@lumiqos/shared/index';

@Controller('ai')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequireRoles('principal', 'school_admin', 'teacher') // Parent explicit block organically
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Get('student-performance/:student_id')
    getStudentPerformance(@Req() req: any, @Param('student_id') studentId: string) {
        return this.aiService.getStudentPerformance(studentId);
    }

    @Get('class-analytics')
    getClassAnalytics(@Req() req: any) {
        // Expects class_id, section_id from query context normally, stubbing for payload test dynamically
        return this.aiService.getClassAnalytics(req.query.class_id, req.query.section_id);
    }

    @Get('risk-students')
    getRiskStudents(@Req() req: any) {
        return this.aiService.getRiskStudents();
    }

    @Post('curriculum/generate')
    generateCurriculum(@Req() req: any, @Body() body: any) {
        return this.aiService.generateCurriculum(body);
    }

    @Post('assessment/generate')
    generateAssessment(@Req() req: any, @Body() body: any) {
        return this.aiService.generateAssessment(body);
    }

    @Post('homework/evaluate')
    evaluateHomework(@Req() req: any, @Body() body: any) {
        return this.aiService.evaluateHomework(body);
    }
}
