import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('report-cards')
export class ReportCardsController {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/report-cards/${path}`;
    }

    private headers(schoolId: string) {
        return { 'x-school-id': schoolId };
    }

    @Post('generate')
    async generate(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('generate'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('class')
    async getByClass(
        @Query('exam_id') examId: string,
        @Query('class_id') classId: string,
        @Query('section_id') sectionId: string,
        @Headers('x-school-id') schoolId: string,
    ) {
        const params = new URLSearchParams();
        if (examId) params.append('exam_id', examId);
        if (classId) params.append('class_id', classId);
        if (sectionId) params.append('section_id', sectionId);
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.url('class')}?${params.toString()}`, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Get('student/:student_id')
    async getByStudent(@Param('student_id') studentId: string, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url(`student/${studentId}`), { headers: this.headers(schoolId) })
        );
        return data;
    }
}
