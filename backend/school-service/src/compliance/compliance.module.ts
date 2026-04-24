import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceIndicator } from '@xceliqos/shared/src/entities/compliance-indicator.entity';
import { ComplianceRecord } from '@xceliqos/shared/src/entities/compliance-record.entity';
import { CurriculumCalendar } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceIndicator,
      ComplianceRecord,
      CurriculumCalendar,
      StudentAttendance,
      School,
    ]),
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
