import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('exam-engine')
export class ExamEngineController {
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

  private async proxy(method: string, path: string, headers: any, body?: any, query?: any) {
    const params = query ? '?' + new URLSearchParams(query).toString() : '';
    const url = `${this.schoolServiceUrl}${path}${params}`;
    const opts = { headers: this.fwd(headers) };
    if (method === 'GET') return (await firstValueFrom(this.http.get(url, opts))).data;
    if (method === 'POST') return (await firstValueFrom(this.http.post(url, body ?? {}, opts))).data;
    if (method === 'PATCH') return (await firstValueFrom(this.http.patch(url, body ?? {}, opts))).data;
  }

  @Post('questions')
  addQuestion(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', '/exam-engine/questions', h, body).then(d => res.json(d));
  }

  @Get('questions')
  listQuestions(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', '/exam-engine/questions', h, null, query).then(d => res.json(d));
  }

  @Post('questions/bulk')
  bulkAdd(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', '/exam-engine/questions/bulk', h, body).then(d => res.json(d));
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', `/exam-engine/questions/${id}`, h).then(d => res.json(d));
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('PATCH', `/exam-engine/questions/${id}`, h, body).then(d => res.json(d));
  }

  @Post('exams/:id/assemble')
  assembleExam(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/exams/${id}/assemble`, h, body).then(d => res.json(d));
  }

  @Get('exams/:id/questions')
  getExamQuestions(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', `/exam-engine/exams/${id}/questions`, h).then(d => res.json(d));
  }

  @Post('exams/:id/answer-sheet')
  createAnswerSheet(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/exams/${id}/answer-sheet`, h, body).then(d => res.json(d));
  }

  @Post('exams/:id/sheets/upload')
  uploadSheet(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/exams/${id}/sheets/upload`, h, body).then(d => res.json(d));
  }

  @Get('exams/:id/sheets')
  getSheets(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', `/exam-engine/exams/${id}/sheets`, h).then(d => res.json(d));
  }

  @Post('exams/:id/item-analysis')
  runItemAnalysis(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/exams/${id}/item-analysis`, h).then(d => res.json(d));
  }

  @Get('exams/:id/item-analysis')
  getItemAnalysis(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', `/exam-engine/exams/${id}/item-analysis`, h).then(d => res.json(d));
  }

  @Post('sheets/:id/confirm')
  confirmMarks(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/sheets/${id}/confirm`, h, body).then(d => res.json(d));
  }

  @Post('sheets/:id/notify-result')
  notifyResult(@Param('id') id: string, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/sheets/${id}/notify-result`, h).then(d => res.json(d));
  }

  @Get('board-syllabus')
  getBoardSyllabus(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', '/exam-engine/board-syllabus', h, null, query).then(d => res.json(d));
  }

  @Post('curriculum-map')
  createCurriculumMap(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', '/exam-engine/curriculum-map', h, body).then(d => res.json(d));
  }

  @Get('curriculum-map')
  getCurriculumMap(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', '/exam-engine/curriculum-map', h, null, query).then(d => res.json(d));
  }

  @Get('curriculum-map/history')
  getCurriculumMapHistory(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', '/exam-engine/curriculum-map/history', h, null, query).then(d => res.json(d));
  }

  @Post('curriculum-map/:id/restore')
  restoreCurriculumMap(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('POST', `/exam-engine/curriculum-map/${id}/restore`, h, body).then(d => res.json(d));
  }

  @Get('curriculum-map/coverage')
  getCoverage(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    return this.proxy('GET', '/exam-engine/curriculum-map/coverage', h, null, query).then(d => res.json(d));
  }
}
