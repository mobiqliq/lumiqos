import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfileController } from './student-profile.controller';
import { StudentProfileService } from './student-profile.service';
import {
    StudentLearningProfile, StudentEnrollment, StudentAttendance, HomeworkSubmission,
    ReportCard, ReportCardSubject, AcademicYear, Subject, Class
} from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentLearningProfile, StudentEnrollment, StudentAttendance, HomeworkSubmission,
            ReportCard, ReportCardSubject, AcademicYear, Subject, Class
        ])
    ],
    controllers: [StudentProfileController],
    providers: [StudentProfileService],
    exports: [StudentProfileService]
})
export class StudentProfileModule { }
