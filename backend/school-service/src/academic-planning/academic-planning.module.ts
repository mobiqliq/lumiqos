import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPlanningService } from './academic-planning.service';
import { AcademicPlanningController } from './academic-planning.controller';
import { AcademicPlan } from '@xceliqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@xceliqos/shared/src/entities/academic-plan-item.entity';
import { PlanningDay } from '@xceliqos/shared/src/entities/planning-day.entity';
import { Board } from '@xceliqos/shared/src/entities/board.entity';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { CurriculumPlan } from '@xceliqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { Exam } from '@xceliqos/shared/src/entities/exam.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { SyllabusTopic } from '@xceliqos/shared/src/entities/syllabus-topic.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';

@Module({
    imports: [
          TypeOrmModule.forFeature([
              AcademicPlan,
              AcademicPlanItem,
              PlanningDay,
              Board,
              Syllabus,
              AcademicCalendarEvent,
              AcademicYear,
              CurriculumPlan,
              CurriculumPlanItem,
              Exam,
              Class,
              Subject,
              SyllabusTopic,
              School
          ]),
    ],
    providers: [AcademicPlanningService],
    controllers: [AcademicPlanningController],
    exports: [AcademicPlanningService],
})
export class AcademicPlanningModule {}
