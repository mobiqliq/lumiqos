import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('substitution')
export class SubstitutionController {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/substitution/${path}`;
    }

    private headers(schoolId: string) {
        return { 'x-school-id': schoolId };
    }

    @Get('absences')
    async getAbsences(@Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(this.url('absences'), { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('allocate')
    async allocate(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('allocate'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }

    @Post('notify')
    async notify(@Body() body: any, @Headers('x-school-id') schoolId: string) {
        const { data } = await firstValueFrom(
            this.httpService.post(this.url('notify'), body, { headers: this.headers(schoolId) })
        );
        return data;
    }
}
