import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPlanningService } from './academic-planning.service';
import { AcademicPlanningController } from './academic-planning.controller';
import { AcademicPlan } from '@lumiqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@lumiqos/shared/src/entities/academic-plan-item.entity';
import { PlanningDay } from '@lumiqos/shared/src/entities/planning-day.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { CurriculumPlan } from '@lumiqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { SyllabusTopic } from '@lumiqos/shared/src/entities/syllabus-topic.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';

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
