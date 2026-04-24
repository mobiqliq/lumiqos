import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumCalendarController } from './curriculum-calendar.controller';
import { CurriculumCalendarService } from './curriculum-calendar.service';
import { CurriculumCalendar } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { CurriculumCalendarEntry } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { SchoolCalendarConfig } from '@xceliqos/shared/src/entities/school-calendar-config.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { SubjectAllocation } from '@xceliqos/shared/src/entities/subject-allocation.entity';
import { SchoolCurriculumMap } from '@xceliqos/shared/src/entities/school-curriculum-map.entity';
import { BoardSyllabus } from '@xceliqos/shared/src/entities/board-syllabus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurriculumCalendar,
      CurriculumCalendarEntry,
      SchoolCalendarConfig,
      WeeklyTimetable,
      SubjectAllocation,
      SchoolCurriculumMap,
      BoardSyllabus,
    ]),
  ],
  controllers: [CurriculumCalendarController],
  providers: [CurriculumCalendarService],
  exports: [CurriculumCalendarService],
})
export class CurriculumCalendarModule {}
