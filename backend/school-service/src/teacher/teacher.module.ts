import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { Message } from '@lumiqos/shared/src/entities/message.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TeacherSubject,
            HomeworkAssignment,
            HomeworkSubmission,
            MessageThread,
            Message,
            AttendanceSession,
            StudentAttendance,
            StudentEnrollment,
            AcademicYear,
            User
        ])
    ],
    controllers: [TeacherController],
    providers: [TeacherService],
    exports: [TeacherService]
})
export class TeacherModule { }
