import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { XceliQScoreService } from './xceliq-score.service';
import type { Request } from 'express';

@Controller('xceliq-score')
export class XceliQScoreController {
    constructor(private readonly xceliQScoreService: XceliQScoreService) {}

    @Get('config')
    getDimensionConfig(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        const school_id = req.headers['x-school-id'] as string;
        return this.xceliQScoreService.getDimensionConfig(school_id, academic_year_id);
    }

    @Post('config')
    upsertDimensionConfig(@Req() req: Request, @Body() dto: any) {
        const school_id = req.headers['x-school-id'] as string;
        return this.xceliQScoreService.upsertDimensionConfig(school_id, dto);
    }

    @Get(':student_id')
    getScore(
        @Param('student_id') student_id: string,
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
    ) {
        const school_id = req.headers['x-school-id'] as string;
        return this.xceliQScoreService.getScore(school_id, student_id, academic_year_id);
    }

    @Post(':student_id/calculate')
    calculateScore(
        @Param('student_id') student_id: string,
        @Req() req: Request,
        @Body() body: {
            academic_year_id: string;
            dimension_scores: Record<string, number>;
            dimension_evidence?: Record<string, string>;
        },
    ) {
        const school_id = req.headers['x-school-id'] as string;
        return this.xceliQScoreService.calculateScore(
            school_id,
            student_id,
            body.academic_year_id,
            body.dimension_scores,
            body.dimension_evidence,
        );
    }
}
