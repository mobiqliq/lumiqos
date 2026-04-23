import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamType } from '@xceliqos/shared/src/entities/exam-type.entity';
import { Exam } from '@xceliqos/shared/src/entities/exam.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { GradeScale } from '@xceliqos/shared/src/entities/grade-scale.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';

import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExamType,
            Exam,
            ExamSubject,
            StudentMarks,
            GradeScale,
            StudentEnrollment,
        ]),
        AiModule
    ],
    controllers: [ExamsController],
    providers: [ExamsService],
    exports: [ExamsService],
})
export class ExamsModule { }
