import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamEngineController } from './exam-engine.controller';
import { ExamEngineService } from './exam-engine.service';
import { QuestionBank } from '@xceliqos/shared/src/entities/question-bank.entity';
import { ExamQuestion } from '@xceliqos/shared/src/entities/exam-question.entity';
import { ExamAnswerSheet } from '@xceliqos/shared/src/entities/exam-answer-sheet.entity';
import { StudentAnswerSheet } from '@xceliqos/shared/src/entities/student-answer-sheet.entity';
import { ItemAnalysis } from '@xceliqos/shared/src/entities/item-analysis.entity';
import { BoardSyllabus } from '@xceliqos/shared/src/entities/board-syllabus.entity';
import { SchoolCurriculumMap } from '@xceliqos/shared/src/entities/school-curriculum-map.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionBank,
      ExamQuestion,
      ExamAnswerSheet,
      StudentAnswerSheet,
      ItemAnalysis,
      BoardSyllabus,
      SchoolCurriculumMap,
      ExamSubject,
      StudentMarks,
      School,
    ]),
  ],
  controllers: [ExamEngineController],
  providers: [ExamEngineService],
  exports: [ExamEngineService],
})
export class ExamEngineModule {}
