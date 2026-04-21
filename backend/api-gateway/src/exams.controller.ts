import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('exams')
export class ExamsController {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/exams/${path}`;
    }

    private headers(schoolId: string) {
        return { 'x-school-id': schoolId };
    }

    @Get()
    async getAll(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url(''), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post()
    async create(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url(''), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('types')
    async getTypes(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url('types'), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('types')
    async createType(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('types'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('subjects')
    async createSubject(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('subjects'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('marks')
    async enterMarks(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('marks'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('results')
    async getResults(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url('results'), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('student/:student_id')
    async getStudentExams(@Param('student_id') studentId: string, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url(`student/${studentId}`), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('grade-scales')
    async createGradeScale(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('grade-scales'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('generate')
    async generate(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('generate'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }
}
