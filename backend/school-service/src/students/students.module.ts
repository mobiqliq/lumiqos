import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@xceliqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@xceliqos/shared/src/entities/student-health-record.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Section } from '@xceliqos/shared/src/entities/section.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Student,
            StudentEnrollment,
            StudentGuardian,
            StudentDocument,
            StudentHealthRecord,
            AcademicYear,
            Class,
            Section,
            HomeworkAssignment,
            HomeworkSubmission
        ])
    ],
    controllers: [StudentsController],
    providers: [StudentsService],
    exports: [StudentsService],
})
export class StudentsModule { }
