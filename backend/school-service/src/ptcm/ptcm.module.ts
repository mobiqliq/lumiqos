import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PTCMController } from './ptcm.controller';
import { PTCMService } from './ptcm.service';
import { PTCMeeting } from '@xceliqos/shared/src/entities/ptc-meeting.entity';
import { PTCMeetingCommitment } from '@xceliqos/shared/src/entities/ptc-meeting-commitment.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PTCMeeting,
      PTCMeetingCommitment,
      StudentAttendance,
      StudentMarks,
      ForgettingCurve,
      HomeworkSubmission,
    ]),
  ],
  controllers: [PTCMController],
  providers: [PTCMService],
  exports: [PTCMService],
})
export class PTCMModule {}
