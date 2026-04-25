import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Portfolio, PortfolioVisibility, PortfolioStatus } from "@xceliqos/shared/src/entities/portfolio.entity";
import { PortfolioItem, PortfolioItemStatus, PortfolioItemCurator } from "@xceliqos/shared/src/entities/portfolio-item.entity";
import { PortfolioConfig } from "@xceliqos/shared/src/entities/portfolio-config.entity";
import { randomBytes } from "crypto";

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio) private portfolioRepo: Repository<Portfolio>,
    @InjectRepository(PortfolioItem) private itemRepo: Repository<PortfolioItem>,
    @InjectRepository(PortfolioConfig) private configRepo: Repository<PortfolioConfig>,
  ) {}

  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig(schoolId: string): Promise<PortfolioConfig> {
    const existing = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (existing) return existing;
    const created = this.configRepo.create({ school_id: schoolId } as any) as unknown as PortfolioConfig;
    return this.configRepo.save(created) as unknown as PortfolioConfig;
  }

  async upsertConfig(schoolId: string, dto: any): Promise<PortfolioConfig> {
    const existing = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing) as unknown as PortfolioConfig;
    }
    const created = this.configRepo.create({ school_id: schoolId, ...dto } as any) as unknown as PortfolioConfig;
    return this.configRepo.save(created) as unknown as PortfolioConfig;
  }

  // ── Portfolio ─────────────────────────────────────────────────────────────

  async getOrCreatePortfolio(schoolId: string, studentId: string, academicYearId: string): Promise<Portfolio> {
    const existing = await this.portfolioRepo.findOne({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    if (existing) return existing;
    const created = this.portfolioRepo.create({
      school_id: schoolId,
      student_id: studentId,
      academic_year_id: academicYearId,
      status: PortfolioStatus.ACTIVE,
      visibility: PortfolioVisibility.PRIVATE,
      visibility_ceiling: PortfolioVisibility.PARENT,
      self_curation_enabled: false,
      total_items: 0,
      teacher_curated_count: 0,
      student_curated_count: 0,
    } as any) as unknown as Portfolio;
    return this.portfolioRepo.save(created) as unknown as Portfolio;
  }

  async getPortfolios(schoolId: string, academicYearId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    }) as any;
  }

  async getPortfolio(schoolId: string, id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepo.findOne({ where: { id, school_id: schoolId } });
    if (!portfolio) throw new NotFoundException("Portfolio not found");
    return portfolio;
  }

  async updatePortfolio(schoolId: string, id: string, dto: any): Promise<Portfolio> {
    const portfolio = await this.getPortfolio(schoolId, id);
    // Enforce visibility ceiling — student cannot set visibility above ceiling
    if (dto.visibility) {
      const order = [PortfolioVisibility.PRIVATE, PortfolioVisibility.CLASS, PortfolioVisibility.SCHOOL, PortfolioVisibility.PARENT, PortfolioVisibility.PUBLIC];
      const ceilingIdx = order.indexOf(portfolio.visibility_ceiling as PortfolioVisibility);
      const requestedIdx = order.indexOf(dto.visibility);
      if (requestedIdx > ceilingIdx) throw new ForbiddenException("Requested visibility exceeds teacher-set ceiling");
    }
    Object.assign(portfolio, dto);
    return this.portfolioRepo.save(portfolio) as unknown as Portfolio;
  }

  async enableSelfCuration(schoolId: string, id: string): Promise<Portfolio> {
    const portfolio = await this.getPortfolio(schoolId, id);
    portfolio.self_curation_enabled = true;
    return this.portfolioRepo.save(portfolio) as unknown as Portfolio;
  }

  async generateShareToken(schoolId: string, id: string, consentGivenBy: string): Promise<Portfolio> {
    const config = await this.getConfig(schoolId);
    if (!config.public_sharing_enabled) throw new ForbiddenException("Public sharing not enabled for this school");
    const portfolio = await this.getPortfolio(schoolId, id);
    portfolio.share_token = randomBytes(24).toString("hex");
    portfolio.share_consent_obtained = true;
    portfolio.share_consent_given_by = consentGivenBy;
    portfolio.share_consent_given_at = new Date();
    portfolio.visibility = PortfolioVisibility.PUBLIC;
    return this.portfolioRepo.save(portfolio) as unknown as Portfolio;
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  async addItem(schoolId: string, portfolioId: string, dto: any): Promise<PortfolioItem> {
    const portfolio = await this.getPortfolio(schoolId, portfolioId);

    // Determine initial status based on curator
    const isStudentCurated = dto.curator === PortfolioItemCurator.STUDENT;
    const config = await this.getConfig(schoolId);
    const initialStatus = isStudentCurated && config.student_item_approval_required
      ? PortfolioItemStatus.DRAFT
      : PortfolioItemStatus.APPROVED;

    const item = this.itemRepo.create({
      school_id: schoolId,
      portfolio_id: portfolioId,
      student_id: portfolio.student_id,
      academic_year_id: portfolio.academic_year_id,
      status: initialStatus,
      ...dto,
    } as any) as unknown as PortfolioItem;
    const saved = await this.itemRepo.save(item) as unknown as PortfolioItem;

    // Update portfolio counts
    await this.syncPortfolioCounts(schoolId, portfolioId);
    return saved;
  }

  async getItems(schoolId: string, portfolioId: string, includeNonApproved = false): Promise<PortfolioItem[]> {
    const qb = this.itemRepo.createQueryBuilder("i")
      .where("i.school_id = :schoolId", { schoolId })
      .andWhere("i.portfolio_id = :portfolioId", { portfolioId })
      .andWhere("i.deleted_at IS NULL");
    if (!includeNonApproved) qb.andWhere("i.status = :status", { status: PortfolioItemStatus.APPROVED });
    return qb.orderBy("i.display_order", "ASC").addOrderBy("i.achievement_date", "DESC").getMany() as any;
  }

  async getItem(schoolId: string, id: string): Promise<PortfolioItem> {
    const item = await this.itemRepo.findOne({ where: { id, school_id: schoolId } });
    if (!item) throw new NotFoundException("Portfolio item not found");
    return item;
  }

  async updateItem(schoolId: string, id: string, dto: any): Promise<PortfolioItem> {
    const item = await this.getItem(schoolId, id);
    Object.assign(item, dto);
    return this.itemRepo.save(item) as unknown as PortfolioItem;
  }

  async submitItemForApproval(schoolId: string, id: string): Promise<PortfolioItem> {
    const item = await this.getItem(schoolId, id);
    if (item.status !== PortfolioItemStatus.DRAFT) throw new ForbiddenException("Only draft items can be submitted");
    item.status = PortfolioItemStatus.PENDING_APPROVAL;
    return this.itemRepo.save(item) as unknown as PortfolioItem;
  }

  async approveItem(schoolId: string, id: string, approverId: string): Promise<PortfolioItem> {
    const item = await this.getItem(schoolId, id);
    item.status = PortfolioItemStatus.APPROVED;
    item.approved_by = approverId;
    item.approved_at = new Date();
    const saved = await this.itemRepo.save(item) as unknown as PortfolioItem;
    await this.syncPortfolioCounts(schoolId, item.portfolio_id);
    return saved;
  }

  async rejectItem(schoolId: string, id: string, feedback: string): Promise<PortfolioItem> {
    const item = await this.getItem(schoolId, id);
    item.status = PortfolioItemStatus.REJECTED;
    item.rejection_feedback = feedback;
    return this.itemRepo.save(item) as unknown as PortfolioItem;
  }

  async getPendingApprovals(schoolId: string, academicYearId: string): Promise<PortfolioItem[]> {
    return this.itemRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, status: PortfolioItemStatus.PENDING_APPROVAL },
    }) as any;
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async syncPortfolioCounts(schoolId: string, portfolioId: string): Promise<void> {
    const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId, school_id: schoolId } });
    if (!portfolio) return;
    const items = await this.itemRepo.find({
      where: { portfolio_id: portfolioId, school_id: schoolId, status: PortfolioItemStatus.APPROVED },
    });
    portfolio.total_items = items.length;
    portfolio.teacher_curated_count = items.filter(i => i.curator === PortfolioItemCurator.TEACHER || i.curator === PortfolioItemCurator.SYSTEM).length;
    portfolio.student_curated_count = items.filter(i => i.curator === PortfolioItemCurator.STUDENT).length;
    await this.portfolioRepo.save(portfolio);
  }
}
