import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentEngagementController } from './parent-engagement.controller';
import { ParentEngagementService } from './parent-engagement.service';
import {
    StudentLearningProfile, StudentGuardian, StudentAttendance, HomeworkSubmission,
    FeeInvoice, AcademicYear
} from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentLearningProfile, StudentGuardian, StudentAttendance, HomeworkSubmission,
            FeeInvoice, AcademicYear
        ])
    ],
    controllers: [ParentEngagementController],
    providers: [ParentEngagementService],
    exports: [ParentEngagementService]
})
export class ParentEngagementModule { }
