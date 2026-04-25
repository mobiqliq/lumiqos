import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlumniController } from "./alumni.controller";
import { AlumniService } from "./alumni.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { AlumniRecord } from "@xceliqos/shared/src/entities/alumni-record.entity";
import { AlumniConfig } from "@xceliqos/shared/src/entities/alumni-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([AlumniRecord, AlumniConfig]),
  ],
  controllers: [AlumniController],
  providers: [AlumniService, JwtStrategy],
  exports: [AlumniService],
})
export class AlumniModule {}
