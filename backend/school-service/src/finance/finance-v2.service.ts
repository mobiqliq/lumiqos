import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantContext } from "@xceliqos/shared";
import { FinanceLedger, FiscalYearStartMonth } from "@xceliqos/shared/src/entities/finance-ledger.entity";
import { FinanceEntry, FinanceEntryType } from "@xceliqos/shared/src/entities/finance-entry.entity";
import { TaxInvoice, TaxFramework, TaxInvoiceStatus } from "@xceliqos/shared/src/entities/tax-invoice.entity";
import { TaxWithholding, WithholdingFramework, WithholdingStatus } from "@xceliqos/shared/src/entities/tax-withholding.entity";
import { FeeStructureVersion } from "@xceliqos/shared/src/entities/fee-structure-version.entity";

@Injectable()
export class FinanceV2Service {
  constructor(
    @InjectRepository(FinanceLedger) private readonly ledgerRepo: Repository<FinanceLedger>,
    @InjectRepository(FinanceEntry) private readonly entryRepo: Repository<FinanceEntry>,
    @InjectRepository(TaxInvoice) private readonly taxInvoiceRepo: Repository<TaxInvoice>,
    @InjectRepository(TaxWithholding) private readonly withholdingRepo: Repository<TaxWithholding>,
    @InjectRepository(FeeStructureVersion) private readonly feeVersionRepo: Repository<FeeStructureVersion>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new BadRequestException("Tenant context missing");
    return store.schoolId;
  }

  // --- Ledger ---

  async upsertLedger(dto: any) {
    const schoolId = this.getSchoolId();
    let ledger = await this.ledgerRepo.findOne({
      where: { school_id: schoolId, academic_year_id: dto.academic_year_id },
    });
    if (ledger) {
      Object.assign(ledger, dto);
      return this.ledgerRepo.save(ledger);
    }
    const created = this.ledgerRepo.create({ ...dto, school_id: schoolId } as any);
    return this.ledgerRepo.save(created);
  }

  async getLedger(academicYearId: string) {
    const schoolId = this.getSchoolId();
    const ledger = await this.ledgerRepo.findOne({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });
    if (!ledger) throw new NotFoundException("Ledger not found for this academic year");
    return ledger;
  }

  // --- Journal Entries ---

  async createEntry(dto: any) {
    const schoolId = this.getSchoolId();
    const ledger = await this.ledgerRepo.findOne({
      where: { school_id: schoolId, id: dto.ledger_id },
    });
    if (!ledger) throw new NotFoundException("Ledger not found");
    if (ledger.is_closed) throw new BadRequestException("Ledger is closed — no new entries permitted");

    const baseAmount = Number(dto.amount) * Number(dto.exchange_rate || 1);
    const entry = this.entryRepo.create({
      ...dto,
      school_id: schoolId,
      base_currency_amount: baseAmount,
      currency: dto.currency || ledger.base_currency,
      exchange_rate: dto.exchange_rate || 1,
    } as any);
    return this.entryRepo.save(entry);
  }

  async getEntries(ledgerId: string, entryType?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.entryRepo.createQueryBuilder("e")
      .where("e.school_id = :schoolId", { schoolId })
      .andWhere("e.ledger_id = :ledgerId", { ledgerId })
      .orderBy("e.entry_date", "DESC");
    if (entryType) qb.andWhere("e.entry_type = :entryType", { entryType });
    return qb.getMany();
  }

  async reverseEntry(entryId: string, reason: string) {
    const schoolId = this.getSchoolId();
    const original = await this.entryRepo.findOne({ where: { id: entryId, school_id: schoolId } });
    if (!original) throw new NotFoundException("Entry not found");
    if (original.is_reversed) throw new BadRequestException("Entry already reversed");

    const reversal = this.entryRepo.create({
      school_id: schoolId,
      ledger_id: original.ledger_id,
      debit_account_code: original.credit_account_code,
      credit_account_code: original.debit_account_code,
      entry_type: FinanceEntryType.REVERSAL,
      amount: original.amount,
      currency: original.currency,
      exchange_rate: original.exchange_rate,
      base_currency_amount: original.base_currency_amount,
      entry_date: new Date().toISOString().split("T")[0],
      narration: "Reversal: " + reason,
      reverses_entry_id: original.id,
      tax_amount: 0,
      tax_breakdown: [],
    } as any);
    await this.entryRepo.save(reversal);

    original.is_reversed = true;
    await this.entryRepo.save(original);
    return reversal;
  }

  // --- Tax Invoices ---

  async createTaxInvoice(dto: any) {
    const schoolId = this.getSchoolId();
    const invoice = this.taxInvoiceRepo.create({ ...dto, school_id: schoolId } as any);
    return this.taxInvoiceRepo.save(invoice);
  }

  async getTaxInvoices(filters: { status?: string; framework?: string }) {
    const schoolId = this.getSchoolId();
    const qb = this.taxInvoiceRepo.createQueryBuilder("ti")
      .where("ti.school_id = :schoolId", { schoolId })
      .orderBy("ti.invoice_date", "DESC");
    if (filters.status) qb.andWhere("ti.status = :status", { status: filters.status });
    if (filters.framework) qb.andWhere("ti.tax_framework = :framework", { framework: filters.framework });
    return qb.getMany();
  }

  async issueTaxInvoice(invoiceId: string) {
    const schoolId = this.getSchoolId();
    const invoice = await this.taxInvoiceRepo.findOne({ where: { id: invoiceId, school_id: schoolId } });
    if (!invoice) throw new NotFoundException("Tax invoice not found");
    if (invoice.status !== TaxInvoiceStatus.DRAFT) throw new BadRequestException("Only draft invoices can be issued");
    invoice.status = TaxInvoiceStatus.ISSUED;
    return this.taxInvoiceRepo.save(invoice);
  }

  async cancelTaxInvoice(invoiceId: string) {
    const schoolId = this.getSchoolId();
    const invoice = await this.taxInvoiceRepo.findOne({ where: { id: invoiceId, school_id: schoolId } });
    if (!invoice) throw new NotFoundException("Tax invoice not found");
    if (invoice.status === TaxInvoiceStatus.CANCELLED) throw new BadRequestException("Already cancelled");
    invoice.status = TaxInvoiceStatus.CANCELLED;
    return this.taxInvoiceRepo.save(invoice);
  }

  // --- Tax Withholding ---

  async createWithholding(dto: any) {
    const schoolId = this.getSchoolId();
    const withholding = this.withholdingRepo.create({ ...dto, school_id: schoolId } as any);
    return this.withholdingRepo.save(withholding);
  }

  async getWithholdings(staffId?: string, framework?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.withholdingRepo.createQueryBuilder("tw")
      .where("tw.school_id = :schoolId", { schoolId })
      .orderBy("tw.period_start", "DESC");
    if (staffId) qb.andWhere("tw.staff_id = :staffId", { staffId });
    if (framework) qb.andWhere("tw.withholding_framework = :framework", { framework });
    return qb.getMany();
  }

  async markWithholdingRemitted(id: string, reference: string) {
    const schoolId = this.getSchoolId();
    const record = await this.withholdingRepo.findOne({ where: { id, school_id: schoolId } });
    if (!record) throw new NotFoundException("Withholding record not found");
    record.status = WithholdingStatus.REMITTED;
    record.remittance_reference = reference;
    record.remitted_at = new Date();
    return this.withholdingRepo.save(record);
  }

  // --- Fee Structure Versions ---

  async upsertFeeStructureVersion(dto: any) {
    const schoolId = this.getSchoolId();
    const latest = await this.feeVersionRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id,
        fee_category_id: dto.fee_category_id,
        is_active: true,
      },
    });

    if (latest) {
      latest.is_active = false;
      latest.effective_to = new Date().toISOString().split("T")[0];
      await this.feeVersionRepo.save(latest);
    }

    const version = this.feeVersionRepo.create({
      ...dto,
      school_id: schoolId,
      version: latest ? latest.version + 1 : 1,
      supersedes_id: latest ? latest.id : null,
      is_active: true,
    } as any);
    return this.feeVersionRepo.save(version);
  }

  async getFeeStructureVersions(academicYearId: string, classId?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.feeVersionRepo.createQueryBuilder("fsv")
      .where("fsv.school_id = :schoolId", { schoolId })
      .andWhere("fsv.academic_year_id = :academicYearId", { academicYearId })
      .orderBy("fsv.effective_from", "DESC");
    if (classId) qb.andWhere("fsv.class_id = :classId", { classId });
    return qb.getMany();
  }

  // --- Export ---

  async exportLedger(academicYearId: string, format?: string) {
    const schoolId = this.getSchoolId();
    const ledger = await this.ledgerRepo.findOne({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });
    if (!ledger) throw new NotFoundException("Ledger not found");

    const entries = await this.entryRepo.find({
      where: { school_id: schoolId, ledger_id: ledger.id },
      order: { entry_date: "ASC" } as any,
    });

    const exportFormat = format || ledger.export_format;

    if (exportFormat === "GENERIC_CSV" || exportFormat === "XERO_CSV" || exportFormat === "ZOHO_CSV") {
      const rows = [
        "Date,Type,Debit Account,Credit Account,Amount,Currency,Narration,Reference",
        ...entries.map(e =>
          [e.entry_date, e.entry_type, e.debit_account_code, e.credit_account_code,
           e.amount, e.currency, (e.narration || "").replace(/,/g, " "), e.reference_id || ""].join(",")
        ),
      ];
      return { format: exportFormat, data: rows.join("\n"), entry_count: entries.length };
    }

    if (exportFormat === "TALLY_XML") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
<HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
<BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA>${
        entries.map(e => `<TALLYMESSAGE><VOUCHER><DATE>${e.entry_date.replace(/-/g, "")}</DATE><NARRATION>${e.narration || ""}</NARRATION><VOUCHERTYPENAME>${e.entry_type}</VOUCHERTYPENAME><AMOUNT>${e.amount}</AMOUNT></VOUCHER></TALLYMESSAGE>`).join("")
      }</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;
      return { format: "TALLY_XML", data: xml, entry_count: entries.length };
    }

    if (exportFormat === "QUICKBOOKS_IIF") {
      const rows = [
        "!TRNS	TRNSTYPE	DATE	ACCNT	AMOUNT	MEMO",
        "!SPL	TRNSTYPE	DATE	ACCNT	AMOUNT	MEMO",
        "!ENDTRNS",
        ...entries.flatMap(e => [
          `TRNS	${e.entry_type}	${e.entry_date}	${e.debit_account_code}	${e.amount}	${e.narration || ""}`,
          `SPL	${e.entry_type}	${e.entry_date}	${e.credit_account_code}	-${e.amount}	${e.narration || ""}`,
          "ENDTRNS",
        ]),
      ];
      return { format: "QUICKBOOKS_IIF", data: rows.join("\n"), entry_count: entries.length };
    }

    return { format: exportFormat, data: entries, entry_count: entries.length };
  }
}
