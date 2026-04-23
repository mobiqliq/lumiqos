import { Controller, Get, Post, Param, Body, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('xceliq-score')
export class XceliQScoreController {
    private readonly schoolServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.configService.get('SCHOOL_SERVICE_PORT', '3001');
        this.schoolServiceUrl = `http://${host}:${port}`;
    }

    @Get('config')
    getDimensionConfig(@Req() req: Request, @Query('academic_year_id') academic_year_id: string) {
        return this.proxyGet(`/xceliq-score/config?academic_year_id=${academic_year_id}`, req);
    }

    @Post('config')
    upsertDimensionConfig(@Req() req: Request, @Body() dto: any) {
        return this.proxyPost('/xceliq-score/config', dto, req);
    }

    @Get(':student_id')
    getScore(
        @Param('student_id') student_id: string,
        @Req() req: Request,
        @Query('academic_year_id') academic_year_id: string,
    ) {
        return this.proxyGet(`/xceliq-score/${student_id}?academic_year_id=${academic_year_id}`, req);
    }

    @Post(':student_id/calculate')
    calculateScore(@Param('student_id') student_id: string, @Req() req: Request, @Body() body: any) {
        return this.proxyPost(`/xceliq-score/${student_id}/calculate`, body, req);
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
