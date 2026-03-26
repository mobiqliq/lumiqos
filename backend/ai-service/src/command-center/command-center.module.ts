import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterService } from './command-center.service';
import { AnalyticsSnapshot, AcademicYear } from '@lumiqos/shared/index';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AnalyticsSnapshot,
            AcademicYear
        ])
    ],
    controllers: [CommandCenterController],
    providers: [CommandCenterService],
    exports: [CommandCenterService]
})
export class CommandCenterModule { }
