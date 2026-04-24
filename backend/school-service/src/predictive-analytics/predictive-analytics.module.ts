import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictiveAnalyticsController } from './predictive-analytics.controller';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { PredictiveAlert } from '@xceliqos/shared/src/entities/predictive-alert.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { CurriculumCalendar } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PredictiveAlert,
      StudentAttendance,
      StudentMarks,
      FeeInvoice,
      FeePayment,
      StudentEnrollment,
      CurriculumCalendar,
      ForgettingCurve,
    ]),
  ],
  controllers: [PredictiveAnalyticsController],
  providers: [PredictiveAnalyticsService],
  exports: [PredictiveAnalyticsService],
})
export class PredictiveAnalyticsModule {}
