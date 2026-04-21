import { Controller, Get, Post, Put, Body, Param, Headers } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('homework')
export class HomeworkController {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/homework/${path}`;
    }

    private headers(schoolId: string) {
        return { 'x-school-id': schoolId };
    }

    @Post()
    async create(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url(''), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.put(this.url(id), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('class')
    async getByClass(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url('class'), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('submit')
    async submit(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('submit'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Put('grade')
    async grade(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.put(this.url('grade'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('completion')
    async getCompletion(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url('completion'), { headers: this.headers(schoolId) })
        );
        return data;
    }
}
