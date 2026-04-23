import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkTransparencyController } from './homework-transparency.controller';
import { HomeworkTransparencyService } from './homework-transparency.service';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkFeedback } from '@xceliqos/shared/src/entities/homework-feedback.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HomeworkAssignment,
      HomeworkSubmission,
      HomeworkFeedback,
      StudentEnrollment,
      StudentGuardian,
    ]),
  ],
  controllers: [HomeworkTransparencyController],
  providers: [HomeworkTransparencyService],
  exports: [HomeworkTransparencyService],
})
export class HomeworkTransparencyModule {}
