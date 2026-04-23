import { Controller, Get, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('school-config/tier')
export class SchoolTierController {
    private readonly schoolServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.configService.get('SCHOOL_SERVICE_PORT', '3001');
        this.schoolServiceUrl = `http://${host}:${port}`;
    }

    @Get()
    getTierConfig(@Req() req: Request) {
        return this.proxyGet('/school-config/tier', req);
    }

    @Post()
    upsertTierConfig(@Req() req: Request, @Body() dto: any) {
        return this.proxyPost('/school-config/tier', dto, req);
    }

    @Get('priority-queue')
    getPriorityQueue(@Req() req: Request) {
        return this.proxyGet('/school-config/tier/priority-queue', req);
    }

    @Get('bundles')
    getBundles(@Req() req: Request) {
        return this.proxyGet('/school-config/tier/bundles', req);
    }

    @Post('bundles')
    upsertBundle(@Req() req: Request, @Body() dto: any) {
        return this.proxyPost('/school-config/tier/bundles', dto, req);
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
