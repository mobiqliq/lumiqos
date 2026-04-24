import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('compliance')
export class ComplianceController {
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

  @Post('seed/nep')
  async seedNEP(@Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/compliance/seed/nep`, {}, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('indicators')
  async getIndicators(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/compliance/indicators?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('assess')
  async assess(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/compliance/assess`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Patch('records/:id')
  async updateRecord(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.patch(`${this.schoolServiceUrl}/compliance/records/${id}`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('report')
  async getReport(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/compliance/report?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('report/export')
  async exportReport(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/compliance/report/export?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }
}
