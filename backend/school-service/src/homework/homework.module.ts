import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HomeworkAssignment,
            HomeworkSubmission,
            StudentEnrollment
        ])
    ],
    controllers: [HomeworkController],
    providers: [HomeworkService],
    exports: [HomeworkService],
})
export class HomeworkModule { }
