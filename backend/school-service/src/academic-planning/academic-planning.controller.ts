import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { AcademicPlanningService } from './academic-planning.service';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { ApprovePlanDto } from './dto/approve-plan.dto';

@Controller('academic-planning')
export class AcademicPlanningController {
    constructor(private readonly planningService: AcademicPlanningService) {}

    @Post('generate')
    async generatePlan(@Body() dto: GeneratePlanDto) {
        return this.planningService.generatePlan(
            dto.school_id, 
            dto.academic_year_id, 
            dto.class_id, 
            dto.subject_id,
            dto.disruption_mode
        );
    }

    @Post('approve')
    async approvePlan(@Body() dto: ApprovePlanDto) {
        return this.planningService.approvePlan(dto.plan_id);
    }

    @Get('status')
    async getPlanStatus(
        @Query('school_id') schoolId: string,
        @Query('academic_year_id') academicYearId: string,
        @Query('class_id') classId: string,
        @Query('subject_id') subjectId: string,
    ) {
        return this.planningService.getLatestPlanStatus(schoolId, academicYearId, classId, subjectId);
    }

    @Get('health-summary')
    async getAcademicHealthSummary(
        @Query('school_id') schoolId: string,
        @Query('academic_year_id') academicYearId: string,
    ) {
        return this.planningService.getAcademicHealthSummary(schoolId, academicYearId);
    }

    @Get('daily-insights')
    async getDailyInsights(
        @Query('school_id') schoolId: string,
        @Query('academic_year_id') academicYearId: string,
    ) {
        return this.planningService.getDailyInsights(schoolId, academicYearId);
    }

    @Get('preview/:plan_id')
    async getPlanPreview(@Param('plan_id') planId: string) {
        return this.planningService.getPlanPreview(planId);
    }

    @Post(':plan_id/update-items')
    async updatePlanItems(
        @Param('plan_id') planId: string,
        @Body() updates: { id: string, planned_date: string }[]
    ) {
        return this.planningService.updatePlanItems(planId, updates);
    }

    @Get(':plan_id')
    async getPlan(@Param('plan_id') planId: string) {
        return this.planningService.getPlan(planId);
    }
}
