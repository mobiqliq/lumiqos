import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GrowthMindsetController } from "./growth-mindset.controller";
import { GrowthMindsetService } from "./growth-mindset.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { MindsetMoment } from "@xceliqos/shared/src/entities/mindset-moment.entity";
import { ParentMindsetProgress } from "@xceliqos/shared/src/entities/parent-mindset-progress.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MindsetMoment, ParentMindsetProgress])],
  controllers: [GrowthMindsetController],
  providers: [GrowthMindsetService, JwtStrategy],
  exports: [GrowthMindsetService],
})
export class GrowthMindsetModule {}
