import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherWellbeingController } from './teacher-wellbeing.controller';
import { TeacherWellbeingService } from './teacher-wellbeing.service';
import { WorkloadIndex } from '@xceliqos/shared/src/entities/workload-index.entity';
import { WorkloadRule } from '@xceliqos/shared/src/entities/workload-rule.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { CurriculumCalendarEntry } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkloadIndex,
      WorkloadRule,
      WeeklyTimetable,
      CurriculumCalendarEntry,
      HomeworkSubmission,
      HomeworkAssignment,
      User,
    ]),
  ],
  controllers: [TeacherWellbeingController],
  providers: [TeacherWellbeingService],
  exports: [TeacherWellbeingService],
})
export class TeacherWellbeingModule {}
