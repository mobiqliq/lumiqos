import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { AttendanceSession } from '@xceliqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { Exam } from '@xceliqos/shared/src/entities/exam.entity';
import { ReportCard } from '@xceliqos/shared/src/entities/report-card.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { Notification } from '@xceliqos/shared/src/entities/notification.entity';
import { MessageThread } from '@xceliqos/shared/src/entities/message-thread.entity';
import { NotificationRecipient } from '@xceliqos/shared/src/entities/notification-recipient.entity';

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
