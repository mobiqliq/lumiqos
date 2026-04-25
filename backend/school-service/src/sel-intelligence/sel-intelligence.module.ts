import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SELIntelligenceController } from "./sel-intelligence.controller";
import { SELIntelligenceService } from "./sel-intelligence.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { SELObservation } from "@xceliqos/shared/src/entities/sel-observation.entity";
import { EQProfile } from "@xceliqos/shared/src/entities/eq-profile.entity";
import { FlowStateLog } from "@xceliqos/shared/src/entities/flow-state-log.entity";
import { SELFrameworkConfig } from "@xceliqos/shared/src/entities/sel-framework-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SELObservation,
      EQProfile,
      FlowStateLog,
      SELFrameworkConfig,
    ]),
  ],
  controllers: [SELIntelligenceController],
  providers: [SELIntelligenceService, JwtStrategy],
  exports: [SELIntelligenceService],
})
export class SELIntelligenceModule {}
