import { Controller, Get, Post, Body, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('school-config')
export class SchoolConfigController {
    private readonly schoolServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.configService.get('SCHOOL_SERVICE_PORT', '3001');
        this.schoolServiceUrl = `http://${host}:${port}`;
    }

    @Get('calendar')
    getCalendarConfig(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        return this.proxyGet(`/school-config/calendar?academic_year_id=${academic_year_id}`, req);
    }

    @Post('calendar')
    upsertCalendarConfig(@Req() req: Request, @Body() dto: any) {
        return this.proxyPost('/school-config/calendar', dto, req);
    }

    @Get('periods')
    getPeriods(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        return this.proxyGet(`/school-config/periods?academic_year_id=${academic_year_id}`, req);
    }

    @Post('periods')
    upsertPeriods(@Req() req: Request, @Body() body: any) {
        return this.proxyPost('/school-config/periods', body, req);
    }

    @Get('timetable')
    getWeeklyTimetable(
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
        @Query('class_id') class_id?: string,
    ) {
        const qs = class_id
            ? `academic_year_id=${academic_year_id}&class_id=${class_id}`
            : `academic_year_id=${academic_year_id}`;
        return this.proxyGet(`/school-config/timetable?${qs}`, req);
    }

    @Post('timetable')
    upsertWeeklyTimetable(@Req() req: Request, @Body() body: any) {
        return this.proxyPost('/school-config/timetable', body, req);
    }

    @Get('allocations')
    getSubjectAllocations(
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
        @Query('class_id') class_id?: string,
    ) {
        const qs = class_id
            ? `academic_year_id=${academic_year_id}&class_id=${class_id}`
            : `academic_year_id=${academic_year_id}`;
        return this.proxyGet(`/school-config/allocations?${qs}`, req);
    }

    @Post('allocations')
    upsertSubjectAllocations(@Req() req: Request, @Body() body: any) {
        return this.proxyPost('/school-config/allocations', body, req);
    }

    private async proxyGet(path: string, req: Request) {
        try {
            const headers = {
                'x-school-id': req.headers['x-school-id'] || '',
                'authorization': req.headers['authorization'] || '',
            };
            const response = await firstValueFrom(
                this.httpService.get(`${this.schoolServiceUrl}${path}`, { headers }),
            );
            return response.data;
        } catch (error) {
            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data || error.message;
            throw new HttpException(message, status);
        }
    }

    private async proxyPost(path: string, body: any, req: Request) {
        try {
            const headers = {
                'x-school-id': req.headers['x-school-id'] || '',
                'authorization': req.headers['authorization'] || '',
            };
            const response = await firstValueFrom(
                this.httpService.post(`${this.schoolServiceUrl}${path}`, body, { headers }),
            );
            return response.data;
        } catch (error) {
            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data || error.message;
            throw new HttpException(message, status);
        }
    }
}
