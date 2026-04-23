import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { ExamEngineService } from './exam-engine.service';
import { QuestionType, BloomLevel, DifficultyLevel } from '@xceliqos/shared/src/entities/question-bank.entity';

@Controller('exam-engine')
export class ExamEngineController {
  constructor(private readonly service: ExamEngineService) {}

  // ── Question Bank ─────────────────────────────────────────────────────────

  @Post('questions')
  addQuestion(@Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.addQuestion(dto, userId);
  }

  @Get('questions')
  listQuestions(
    @Query('subject_id') subject_id?: string,
    @Query('class_id') class_id?: string,
    @Query('topic') topic?: string,
    @Query('bloom_level') bloom_level?: BloomLevel,
    @Query('difficulty') difficulty?: DifficultyLevel,
    @Query('question_type') question_type?: QuestionType,
    @Query('board_id') board_id?: string,
    @Query('board_topic_id') board_topic_id?: string,
  ) {
    return this.service.listQuestions({ subject_id, class_id, topic, bloom_level, difficulty, question_type, board_id, board_topic_id });
  }

  @Post('questions/bulk')
  bulkAddQuestions(@Body('questions') questions: any[], @Headers('x-user-id') userId: string) {
    return this.service.bulkAddQuestions(questions, userId);
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string) {
    return this.service.getQuestion(id);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.updateQuestion(id, dto, userId);
  }

  // ── Exam Assembly ─────────────────────────────────────────────────────────

  @Post('exams/:examSubjectId/assemble')
  assembleExam(@Param('examSubjectId') id: string, @Body() params: any, @Headers('x-user-id') userId: string) {
    return this.service.assembleExam(id, params, userId);
  }

  @Get('exams/:examSubjectId/questions')
  getExamQuestions(@Param('examSubjectId') id: string) {
    return this.service.getExamQuestions(id);
  }

  // ── Answer Sheet ──────────────────────────────────────────────────────────

  @Post('exams/:examSubjectId/answer-sheet')
  createAnswerSheet(@Param('examSubjectId') id: string, @Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.createAnswerSheet(id, dto, userId);
  }

  @Post('exams/:examSubjectId/sheets/upload')
  uploadStudentSheet(
    @Param('examSubjectId') examSubjectId: string,
    @Body('student_id') studentId: string,
    @Body('image_url') imageUrl: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.uploadStudentSheet(examSubjectId, studentId, imageUrl, userId);
  }

  @Get('exams/:examSubjectId/sheets')
  getStudentSheets(@Param('examSubjectId') id: string) {
    return this.service.getStudentSheets(id);
  }

  @Post('sheets/:id/confirm')
  confirmMarks(@Param('id') id: string, @Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.confirmMarks(id, dto, userId);
  }

  @Post('sheets/:id/notify-result')
  notifyResult(@Param('id') id: string) {
    return this.service.notifyResult(id);
  }

  // ── Item Analysis ─────────────────────────────────────────────────────────

  @Post('exams/:examSubjectId/item-analysis')
  runItemAnalysis(@Param('examSubjectId') id: string, @Headers('x-user-id') userId: string) {
    return this.service.runItemAnalysis(id, userId);
  }

  @Get('exams/:examSubjectId/item-analysis')
  getItemAnalysis(@Param('examSubjectId') id: string) {
    return this.service.getItemAnalysis(id);
  }

  // ── Board Syllabus ────────────────────────────────────────────────────────

  @Get('board-syllabus')
  getBoardSyllabus(
    @Query('board_id') boardId: string,
    @Query('grade') grade?: string,
    @Query('subject_id') subjectId?: string,
  ) {
    return this.service.getBoardSyllabus(boardId, grade ? parseInt(grade) : undefined, subjectId);
  }

  // ── Curriculum Map ────────────────────────────────────────────────────────

  @Post('curriculum-map')
  createCurriculumMap(@Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.createCurriculumMap(dto, userId);
  }

  @Get('curriculum-map')
  getCurriculumMap(
    @Query('subject_id') subjectId: string,
    @Query('class_id') classId: string,
    @Query('academic_year_id') academicYearId?: string,
  ) {
    return this.service.getCurriculumMap(subjectId, classId, academicYearId);
  }

  @Get('curriculum-map/history')
  getCurriculumMapHistory(
    @Query('subject_id') subjectId: string,
    @Query('class_id') classId: string,
  ) {
    return this.service.getCurriculumMapHistory(subjectId, classId);
  }

  @Post('curriculum-map/:id/restore')
  restoreCurriculumMap(
    @Param('id') id: string,
    @Body('academic_year_id') academicYearId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.restoreCurriculumMap(id, academicYearId, userId);
  }

  @Get('curriculum-map/coverage')
  getCurriculumCoverage(
    @Query('subject_id') subjectId: string,
    @Query('class_id') classId: string,
  ) {
    return this.service.getCurriculumCoverage(subjectId, classId);
  }
}
