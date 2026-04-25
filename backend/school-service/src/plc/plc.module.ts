import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PLCController } from "./plc.controller";
import { PLCService } from "./plc.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { PLCGroup } from "@xceliqos/shared/src/entities/plc-group.entity";
import { PLCSession } from "@xceliqos/shared/src/entities/plc-session.entity";
import { PLCResource } from "@xceliqos/shared/src/entities/plc-resource.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PLCGroup, PLCSession, PLCResource])],
  controllers: [PLCController],
  providers: [PLCService, JwtStrategy],
  exports: [PLCService],
})
export class PLCModule {}
