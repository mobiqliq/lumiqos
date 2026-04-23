import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportCardsController } from './report-cards.controller';
import { ReportCardsService } from './report-cards.service';
import { ReportCard } from '@xceliqos/shared/src/entities/report-card.entity';
import { ReportCardSubject } from '@xceliqos/shared/src/entities/report-card-subject.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { GradeScale } from '@xceliqos/shared/src/entities/grade-scale.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ReportCard,
            ReportCardSubject,
            ExamSubject,
            StudentMarks,
            StudentEnrollment,
            GradeScale
        ])
    ],
    controllers: [ReportCardsController],
    providers: [ReportCardsService],
    exports: [ReportCardsService],
})
export class ReportCardsModule { }
