import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { NotificationRecipient } from '@lumiqos/shared/src/entities/notification-recipient.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';

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
