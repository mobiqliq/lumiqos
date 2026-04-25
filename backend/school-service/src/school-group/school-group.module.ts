import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SchoolGroupController } from "./school-group.controller";
import { SchoolGroupService } from "./school-group.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { SchoolGroup } from "@xceliqos/shared/src/entities/school-group.entity";
import { SchoolGroupMember } from "@xceliqos/shared/src/entities/school-group-member.entity";
import { SchoolGroupConfig } from "@xceliqos/shared/src/entities/school-group-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolGroup,
      SchoolGroupMember,
      SchoolGroupConfig,
    ]),
  ],
  controllers: [SchoolGroupController],
  providers: [SchoolGroupService, JwtStrategy],
  exports: [SchoolGroupService],
})
export class SchoolGroupModule {}
