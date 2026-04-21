import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('communication')
export class CommunicationController {
    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/${path}`;
    }

    private headers(schoolId: string) {
        return { 'x-school-id': schoolId };
    }

    @Post('messages/thread')
    async createThread(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.http.post(this.url('messages/thread'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('messages/send')
    async sendMessage(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.http.post(this.url('messages/send'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('messages/thread/:thread_id')
    async getThread(@Param('thread_id') threadId: string, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.http.get(this.url(`messages/thread/${threadId}`), { headers: this.headers(schoolId) })
        );
        return data;
    }
}
