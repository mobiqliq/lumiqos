import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardReportingController } from "./board-reporting.controller";
import { BoardReportingService } from "./board-reporting.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { BoardReport } from "@xceliqos/shared/src/entities/board-report.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardReport])],
  controllers: [BoardReportingController],
  providers: [BoardReportingService, JwtStrategy],
  exports: [BoardReportingService],
})
export class BoardReportingModule {}
