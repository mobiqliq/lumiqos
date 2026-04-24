import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('student-wellbeing')
export class StudentWellbeingController {
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

  @Post('scan/:studentId')
  async scan(@Param('studentId') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/student-wellbeing/scan/${id}`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('scan/class/:classId')
  async scanClass(@Param('classId') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/student-wellbeing/scan/class/${id}`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('flags')
  async getFlags(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/student-wellbeing/flags?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('flags/:studentId')
  async getStudentFlags(@Param('studentId') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/student-wellbeing/flags/${id}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Patch('flags/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.patch(`${this.schoolServiceUrl}/student-wellbeing/flags/${id}/status`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('guides/:signal_type')
  async getGuide(@Param('signal_type') type: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/student-wellbeing/guides/${type}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }
}
