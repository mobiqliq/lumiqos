import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OperationsController } from "./operations.controller";
import { OperationsService } from "./operations.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { LibraryRecord } from "@xceliqos/shared/src/entities/library-record.entity";
import { TransportRoute } from "@xceliqos/shared/src/entities/transport-route.entity";
import { TransportAssignment } from "@xceliqos/shared/src/entities/transport-assignment.entity";
import { VisitorLog } from "@xceliqos/shared/src/entities/visitor-log.entity";
import { OperationsConfig } from "@xceliqos/shared/src/entities/operations-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LibraryRecord,
      TransportRoute,
      TransportAssignment,
      VisitorLog,
      OperationsConfig,
    ]),
  ],
  controllers: [OperationsController],
  providers: [OperationsService, JwtStrategy],
  exports: [OperationsService],
})
export class OperationsModule {}
