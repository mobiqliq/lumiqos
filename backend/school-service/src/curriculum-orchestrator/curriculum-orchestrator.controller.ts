import { Controller, Post, Get, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CurriculumPlannerService } from './services/planner.service';
import { CurriculumTrackingService } from './services/tracking.service';
import { CurriculumReschedulerService } from './services/rescheduler.service';
import { GeneratePlanDto, LogTeachingDto } from './dto/orchestrator.dto';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { AcademicPlanningService } from '../academic-planning/academic-planning.service';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('curriculum-orchestrator')
@UseGuards(JwtAuthGuard)
export class CurriculumOrchestratorController {
    constructor(
        private readonly plannerService: CurriculumPlannerService,
        private readonly trackingService: CurriculumTrackingService,
        private readonly reschedulerService: CurriculumReschedulerService,
        private readonly academicPlanningService: AcademicPlanningService,
    ) {}

    @Post('generate-plan')
    async generatePlan() {
        throw new HttpException('Deprecated. Use Academic Planning Engine', HttpStatus.GONE);
    }

    @Get('dashboard-summary')
    async getDashboardSummary(
        @Req() req: any,
        @Query('class_id') classId: string,
        @Query('academic_year_id') academicYearId: string
    ) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        
        // 1. Fetch all subjects for this class
        const plans = await this.plannerService.getPlansForClass(schoolId, academicYearId, classId);
        
        // 2. Perform guard check for each subject
        const summaries = await Promise.all(plans.map(async (plan: any) => {
            // Check if there is an APPROVED academic plan for this subject
            const res = await this.academicPlanningService.getLatestPlanStatus(
                schoolId, academicYearId, classId, plan.subject_id
            );

            if (res.status !== 'APPROVED') {
                return null; // Return nothing for this subject if not approved
            }

            const summary = await this.trackingService.getCurriculumSummary(
                schoolId, academicYearId, classId, plan.subject_id
            );
            
            if (!summary) return null;
            return {
                ...summary,
                subject_name: plan.subject?.name || 'Unknown'
            };
        }));

        return summaries.filter((s: any) => s !== null);
    }

    @Get('plan/:id')
    async getPlan(@Req() req: any, @Param('id') id: string) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        return this.plannerService.getPlan(schoolId, id);
    }

    @Post('log-teaching')
    async logTeaching(@Req() req: any, @Body() dto: LogTeachingDto) {
        const schoolId = req.user?.schoolId || 'f2efb39f-304b-4841-8faf-7bda14454aac';
        const teacherId = req.user?.id || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
        return this.trackingService.logTeaching(schoolId, teacherId, dto);
    }

    @Post('recalculate')
    async recalculate() {
        throw new HttpException('Deprecated. Use Academic Planning Engine', HttpStatus.GONE);
    }
}
