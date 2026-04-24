import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XceliQReviseController } from './xceliq-revise.controller';
import { XceliQReviseService } from './xceliq-revise.service';
import { RetrievalTask } from '@xceliqos/shared/src/entities/retrieval-task.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { CurriculumCalendarEntry } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { StudentConceptMastery } from '@xceliqos/shared/src/entities/student-concept-mastery.entity';
import { QuestionBank } from '@xceliqos/shared/src/entities/question-bank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RetrievalTask,
      ForgettingCurve,
      CurriculumCalendarEntry,
      StudentConceptMastery,
      QuestionBank,
    ]),
  ],
  controllers: [XceliQReviseController],
  providers: [XceliQReviseService],
  exports: [XceliQReviseService],
})
export class XceliQReviseModule {}
