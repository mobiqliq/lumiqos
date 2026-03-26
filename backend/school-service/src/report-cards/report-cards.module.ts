import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportCardsController } from './report-cards.controller';
import { ReportCardsService } from './report-cards.service';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { ReportCardSubject } from '@lumiqos/shared/src/entities/report-card-subject.entity';
import { ExamSubject } from '@lumiqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@lumiqos/shared/src/entities/student-marks.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { GradeScale } from '@lumiqos/shared/src/entities/grade-scale.entity';

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
