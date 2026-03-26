import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamType } from '@lumiqos/shared/src/entities/exam-type.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { ExamSubject } from '@lumiqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@lumiqos/shared/src/entities/student-marks.entity';
import { GradeScale } from '@lumiqos/shared/src/entities/grade-scale.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';

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
