import { Controller, Get, Post, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('xceliq-revise')
export class XceliQReviseController {
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

  @Post('schedule/:studentId')
  async schedule(@Param('studentId') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/xceliq-revise/schedule/${id}`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get('tasks/:studentId')
  async getDueTasks(@Param('studentId') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/xceliq-revise/tasks/${id}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Post('tasks/:taskId/respond')
  async submitResponse(@Param('taskId') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/xceliq-revise/tasks/${id}/respond`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get('curve/:studentId')
  async getCurve(@Param('studentId') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/xceliq-revise/curve/${id}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get('analytics/:studentId')
  async getAnalytics(@Param('studentId') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/xceliq-revise/analytics/${id}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }
}
