import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('teacher-wellbeing')
export class TeacherWellbeingController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.config.get('SCHOOL_SERVICE_PORT', '3000');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  private fwd(headers: any) {
    return {
      'x-school-id': headers['x-school-id'],
      'x-user-id': headers['x-user-id'],
      'content-type': 'application/json',
    };
  }

  @Get('rules')
  async getRules(@Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/teacher-wellbeing/rules`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('rules')
  async upsertRules(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/teacher-wellbeing/rules`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('workload/compute')
  async compute(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/teacher-wellbeing/workload/compute`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('workload')
  async getHeatmap(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/teacher-wellbeing/workload?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('workload/:staffId')
  async getStaffWorkload(@Param('staffId') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/teacher-wellbeing/workload/${id}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('check-assignment')
  async checkAssignment(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/teacher-wellbeing/check-assignment`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('referral')
  async submitReferral(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/teacher-wellbeing/referral`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Patch('workload/:id/acknowledge')
  async acknowledge(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.patch(`${this.schoolServiceUrl}/teacher-wellbeing/workload/${id}/acknowledge`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }
}
