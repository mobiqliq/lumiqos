import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XceliQScore } from '@xceliqos/shared/src/entities/xceliq-score.entity';
import { XceliQScoreDimension } from '@xceliqos/shared/src/entities/xceliq-score-dimension.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { XceliQScoreService } from './xceliq-score.service';
import { XceliQScoreController } from './xceliq-score.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            XceliQScore,
            XceliQScoreDimension,
            Student,
        ]),
    ],
    controllers: [XceliQScoreController],
    providers: [XceliQScoreService],
    exports: [XceliQScoreService],
})
export class XceliQScoreModule {}
