import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@lumiqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@lumiqos/shared/src/entities/student-health-record.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';

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
