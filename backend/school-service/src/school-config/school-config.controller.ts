import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { SchoolConfigService } from './school-config.service';
import type { Request } from 'express';

@Controller('school-config')
export class SchoolConfigController {
    constructor(private readonly schoolConfigService: SchoolConfigService) {}

    @Get('calendar')
    getCalendarConfig(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.getCalendarConfig(school_id, academic_year_id);
    }

    @Post('calendar')
    upsertCalendarConfig(@Req() req: Request, @Body() dto: any) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.upsertCalendarConfig(school_id, dto);
    }

    @Get('periods')
    getPeriods(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.getPeriods(school_id, academic_year_id);
    }

    @Post('periods')
    upsertPeriods(@Req() req: Request, @Body() body: { academic_year_id: string; periods: any[] }) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.upsertPeriods(school_id, body.academic_year_id, body.periods);
    }

    @Get('timetable')
    getWeeklyTimetable(
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
        @Query('class_id') class_id?: string,
    ) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.getWeeklyTimetable(school_id, academic_year_id, class_id);
    }

    @Post('timetable')
    upsertWeeklyTimetable(@Req() req: Request, @Body() body: { entries: any[] }) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.upsertWeeklyTimetable(school_id, body.entries);
    }

    @Get('allocations')
    getSubjectAllocations(
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
        @Query('class_id') class_id?: string,
    ) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.getSubjectAllocations(school_id, academic_year_id, class_id);
    }

    @Post('allocations')
    upsertSubjectAllocations(@Req() req: Request, @Body() body: { allocations: any[] }) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolConfigService.upsertSubjectAllocations(school_id, body.allocations);
    }
}
