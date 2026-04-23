import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { ReportCard } from '@xceliqos/shared/src/entities/report-card.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { NotificationRecipient } from '@xceliqos/shared/src/entities/notification-recipient.entity';
import { MessageThread } from '@xceliqos/shared/src/entities/message-thread.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StudentGuardian,
            Student,
            StudentEnrollment,
            StudentAttendance,
            HomeworkAssignment,
            HomeworkSubmission,
            ReportCard,
            FeeInvoice,
            FeePayment,
            NotificationRecipient,
            MessageThread,
            AcademicYear
        ])
    ],
    controllers: [ParentController],
    providers: [ParentService],
    exports: [ParentService]
})
export class ParentModule { }
