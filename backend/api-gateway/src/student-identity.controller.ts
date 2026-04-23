import { Controller, Get, Post, Param, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('students')
export class StudentIdentityController {
    private readonly schoolServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.configService.get('SCHOOL_SERVICE_PORT', '3001');
        this.schoolServiceUrl = `http://${host}:${port}`;
    }

    @Get(':id/passport')
    getPassport(@Param('id') id: string, @Req() req: Request) {
        return this.proxyGet(`/students/${id}/passport`, req);
    }

    @Post(':id/transfer')
    initiateTransfer(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
        return this.proxyPost(`/students/${id}/transfer`, body, req);
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
