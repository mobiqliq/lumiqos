import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinanceV2Controller } from "./finance-v2.controller";
import { FinanceV2Service } from "./finance-v2.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { FinanceLedger } from "@xceliqos/shared/src/entities/finance-ledger.entity";
import { FinanceEntry } from "@xceliqos/shared/src/entities/finance-entry.entity";
import { TaxInvoice } from "@xceliqos/shared/src/entities/tax-invoice.entity";
import { TaxWithholding } from "@xceliqos/shared/src/entities/tax-withholding.entity";
import { FeeStructureVersion } from "@xceliqos/shared/src/entities/fee-structure-version.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinanceLedger,
      FinanceEntry,
      TaxInvoice,
      TaxWithholding,
      FeeStructureVersion,
    ]),
  ],
  controllers: [FinanceV2Controller],
  providers: [FinanceV2Service, JwtStrategy],
  exports: [FinanceV2Service],
})
export class FinanceV2Module {}
