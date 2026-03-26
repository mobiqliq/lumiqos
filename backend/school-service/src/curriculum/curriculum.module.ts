import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { AiModule } from '../ai/ai.module';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Syllabus, AcademicCalendarEvent, LessonPlan, CurriculumMapping, Subject, School, Class, TeacherSubject, CurriculumPlanItem]),
    AiModule
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService]
})
export class CurriculumModule { }
