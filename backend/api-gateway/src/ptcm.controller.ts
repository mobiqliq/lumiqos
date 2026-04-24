import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('ptcm')
export class PTCMController {
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
      'x-user-role': headers['x-user-role'],
      'content-type': 'application/json',
    };
  }

  @Post('meetings')
  async schedule(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/ptcm/meetings`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('meetings')
  async list(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/ptcm/meetings?${params}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('meetings/:id')
  async get(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/ptcm/meetings/${id}`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('meetings/:id/teacher-brief')
  async teacherBrief(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/ptcm/meetings/${id}/teacher-brief`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('meetings/:id/parent-brief')
  async parentBrief(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/ptcm/meetings/${id}/parent-brief`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('meetings/:id/notes')
  async addNote(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/ptcm/meetings/${id}/notes`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Post('meetings/:id/commitments')
  async addCommitments(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.post(`${this.schoolServiceUrl}/ptcm/meetings/${id}/commitments`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Patch('meetings/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.patch(`${this.schoolServiceUrl}/ptcm/meetings/${id}/status`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Get('commitments')
  async getCommitments(@Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.get(`${this.schoolServiceUrl}/ptcm/commitments`, { headers: this.fwd(h) }));
    return res.json(r.data);
  }

  @Patch('commitments/:id')
  async completeCommitment(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(this.http.patch(`${this.schoolServiceUrl}/ptcm/commitments/${id}`, body, { headers: this.fwd(h) }));
    return res.json(r.data);
  }
}
