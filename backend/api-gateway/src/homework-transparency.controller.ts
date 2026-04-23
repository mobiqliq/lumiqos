import { Controller, Get, Post, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('homework-transparency')
export class HomeworkTransparencyController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.config.get('SCHOOL_SERVICE_PORT', '3000');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Get('student/:studentId')
  async getStudentView(@Param('studentId') id: string, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/homework-transparency/student/${id}`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('parent/:studentId')
  async getParentView(@Param('studentId') id: string, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/homework-transparency/parent/${id}`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('teacher/queue')
  async getTeacherQueue(@Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/homework-transparency/teacher/queue`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Post('submissions/:id/feedback')
  async submitFeedback(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/homework-transparency/submissions/${id}/feedback`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Post('submissions/:id/notify-parent')
  async notifyParent(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/homework-transparency/submissions/${id}/notify-parent`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('analytics/class')
  async getClassAnalytics(@Query() query: any, @Headers() headers: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/homework-transparency/analytics/class?${params}`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  private fwd(headers: any) {
    return {
      'x-school-id': headers['x-school-id'],
      'x-user-id': headers['x-user-id'],
      'x-user-role': headers['x-user-role'],
      'content-type': 'application/json',
    };
  }
}
