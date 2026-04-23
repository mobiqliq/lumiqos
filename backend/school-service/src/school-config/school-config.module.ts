import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolCalendarConfig } from '@xceliqos/shared/src/entities/school-calendar-config.entity';
import { TimetablePeriod } from '@xceliqos/shared/src/entities/timetable-period.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { SubjectAllocation } from '@xceliqos/shared/src/entities/subject-allocation.entity';
import { SchoolConfigService } from './school-config.service';
import { SchoolConfigController } from './school-config.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SchoolCalendarConfig,
            TimetablePeriod,
            WeeklyTimetable,
            SubjectAllocation,
        ]),
    ],
    controllers: [SchoolConfigController],
    providers: [SchoolConfigService],
    exports: [SchoolConfigService],
})
export class SchoolConfigModule {}
