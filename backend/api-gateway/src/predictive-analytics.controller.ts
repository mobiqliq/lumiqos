import { Controller, Get, Post, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('predictive-analytics')
export class PredictiveAnalyticsController {
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

  @Post('run/dropout-risk')
  async runDropout(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/run/dropout-risk`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('run/assessment-failure')
  async runAssessment(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/run/assessment-failure`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('run/fee-default')
  async runFeeDefault(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/run/fee-default`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('run/curriculum-shortfall')
  async runShortfall(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/run/curriculum-shortfall`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('run/all')
  async runAll(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/run/all`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('alerts')
  async getAlerts(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/predictive-analytics/alerts?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('alerts/:id/acknowledge')
  async acknowledge(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/predictive-analytics/alerts/${id}/acknowledge`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }
}
