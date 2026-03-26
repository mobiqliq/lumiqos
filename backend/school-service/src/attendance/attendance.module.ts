import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';

import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AttendanceSession,
            StudentAttendance,
            StudentEnrollment
        ]),
        AiModule
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
