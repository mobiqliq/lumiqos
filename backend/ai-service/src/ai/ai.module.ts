import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import {
    Student,
    StudentEnrollment,
    StudentAttendance,
    HomeworkSubmission,
    ReportCard,
    ReportCardSubject,
    AcademicYear,
    AnalyticsSnapshot
} from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Student,
            StudentEnrollment,
            StudentAttendance,
            HomeworkSubmission,
            ReportCard,
            ReportCardSubject,
            AcademicYear,
            AnalyticsSnapshot
        ])
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService]
})
export class AiModule { }
