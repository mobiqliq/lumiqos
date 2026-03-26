import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { Notification } from '@lumiqos/shared/src/entities/notification.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AcademicYear,
            Student,
            StudentEnrollment,
            AttendanceSession,
            StudentAttendance,
            Exam,
            ReportCard,
            Class,
            HomeworkAssignment,

            HomeworkSubmission,
            FeeInvoice,
            FeePayment,
            Notification,
            MessageThread,
            NotificationRecipient
        ])
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService]
})
export class DashboardModule { }
