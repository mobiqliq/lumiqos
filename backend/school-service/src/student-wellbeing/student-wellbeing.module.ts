import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentWellbeingController } from './student-wellbeing.controller';
import { StudentWellbeingService } from './student-wellbeing.service';
import { WellbeingFlag } from '@xceliqos/shared/src/entities/wellbeing-flag.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { RetrievalTask } from '@xceliqos/shared/src/entities/retrieval-task.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WellbeingFlag,
      StudentAttendance,
      ForgettingCurve,
      RetrievalTask,
      HomeworkSubmission,
      HomeworkAssignment,
      StudentEnrollment,
    ]),
  ],
  controllers: [StudentWellbeingController],
  providers: [StudentWellbeingService],
  exports: [StudentWellbeingService],
})
export class StudentWellbeingModule {}
