import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdmissionsController } from "./admissions.controller";
import { AdmissionsService } from "./admissions.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { AdmissionApplication } from "@xceliqos/shared/src/entities/admission-application.entity";
import { AdmissionDocument } from "@xceliqos/shared/src/entities/admission-document.entity";
import { WaitlistEntry } from "@xceliqos/shared/src/entities/waitlist-entry.entity";
import { ReservationConfig } from "@xceliqos/shared/src/entities/reservation-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdmissionApplication,
      AdmissionDocument,
      WaitlistEntry,
      ReservationConfig,
    ]),
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService, JwtStrategy],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
