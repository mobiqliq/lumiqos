import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FeeCategory } from '@lumiqos/shared/src/entities/fee-category.entity';
import { FeeStructure } from '@lumiqos/shared/src/entities/fee-structure.entity';
import { StudentFeeAccount } from '@lumiqos/shared/src/entities/student-fee-account.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@lumiqos/shared/src/entities/fee-payment.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { InventoryItem } from '@lumiqos/shared/src/entities/inventory-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FeeCategory,
            FeeStructure,
            StudentFeeAccount,
            FeeInvoice,
            FeePayment,
            Student,
            InventoryItem
        ])
    ],
    controllers: [FinanceController],
    providers: [FinanceService],
    exports: [FinanceService]
})
export class FinanceModule { }
