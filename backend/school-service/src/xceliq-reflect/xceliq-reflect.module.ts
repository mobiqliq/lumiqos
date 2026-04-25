import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { XceliQReflectController } from "./xceliq-reflect.controller";
import { XceliQReflectService } from "./xceliq-reflect.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { ReflectionEntry } from "@xceliqos/shared/src/entities/reflection-entry.entity";
import { MetacognitiveScore } from "@xceliqos/shared/src/entities/metacognitive-score.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReflectionEntry, MetacognitiveScore])],
  controllers: [XceliQReflectController],
  providers: [XceliQReflectService, JwtStrategy],
  exports: [XceliQReflectService],
})
export class XceliQReflectModule {}
