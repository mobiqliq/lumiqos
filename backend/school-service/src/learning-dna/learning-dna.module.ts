import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LearningDNAController } from "./learning-dna.controller";
import { LearningDNAService } from "./learning-dna.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { LearningDNAProfile } from "@xceliqos/shared/src/entities/learning-dna-profile.entity";
import { LearningDNAObservation } from "@xceliqos/shared/src/entities/learning-dna-observation.entity";
import { ChronobioConfig } from "@xceliqos/shared/src/entities/chronobio-config.entity";
import { CognitiveLoadRule } from "@xceliqos/shared/src/entities/cognitive-load-rule.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningDNAProfile,
      LearningDNAObservation,
      ChronobioConfig,
      CognitiveLoadRule,
    ]),
  ],
  controllers: [LearningDNAController],
  providers: [LearningDNAService, JwtStrategy],
  exports: [LearningDNAService],
})
export class LearningDNAModule {}
