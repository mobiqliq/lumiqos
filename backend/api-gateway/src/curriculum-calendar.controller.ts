import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('curriculum-calendar')
export class CurriculumCalendarController {
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

  @Post('generate')
  async generate(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/curriculum-calendar/generate`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get()
  async getCalendar(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/curriculum-calendar?${params}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.patch(`${this.schoolServiceUrl}/curriculum-calendar/${id}/publish`, {}, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Post('entries/:id/mark-taught')
  async markTaught(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/curriculum-calendar/entries/${id}/mark-taught`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Post(':id/rebalance')
  async rebalance(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/curriculum-calendar/${id}/rebalance`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Post(':id/rebalance/apply')
  async applyRebalance(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/curriculum-calendar/${id}/rebalance/apply`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get('coverage')
  async getCoverage(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/curriculum-calendar/coverage?${params}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }
}
