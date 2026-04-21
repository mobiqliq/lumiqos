import { Controller, Post, Body, Headers } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('timetable')
export class TimetableController {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/timetable/${path}`;
    }

    @Post('generate')
    async generate(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('generate'), body, {
                headers: { 'x-school-id': schoolId },
            })
        );
        return data;
    }
}
