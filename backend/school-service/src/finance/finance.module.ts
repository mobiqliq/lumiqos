import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FeeCategory } from '@xceliqos/shared/src/entities/fee-category.entity';
import { FeeStructure } from '@xceliqos/shared/src/entities/fee-structure.entity';
import { StudentFeeAccount } from '@xceliqos/shared/src/entities/student-fee-account.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { InventoryItem } from '@xceliqos/shared/src/entities/inventory-item.entity';

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
