import { Controller, Get, Param, Req, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('intelligence-graph')
export class IntelligenceGraphController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.configService.get('SCHOOL_SERVICE_PORT', '3001');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Get('class/:classId/heatmap')
  async getClassHeatmap(@Param('classId') classId: string, @Req() req: Request) {
    return this.proxyRequest(`/intelligence-graph/class/${classId}/heatmap`, req);
  }

  @Get('class/:classId/struggling-students')
  async getStrugglingStudents(@Param('classId') classId: string, @Req() req: Request) {
    return this.proxyRequest(`/intelligence-graph/class/${classId}/struggling-students`, req);
  }

  @Get('student/:studentId/radar')
  async getStudentRadar(@Param('studentId') studentId: string, @Req() req: Request) {
    return this.proxyRequest(`/intelligence-graph/student/${studentId}/radar`, req);
  }

  private async proxyRequest(path: string, req: Request) {
    try {
      const headers = {
        'x-school-id': req.headers['x-school-id'] || '',
      };
      const response = await firstValueFrom(
        this.httpService.get(`${this.schoolServiceUrl}${path}`, { headers })
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data || error.message;
      throw new HttpException(message, status);
    }
  }
}
