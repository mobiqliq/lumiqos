import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BoardReport, BoardReportType, BoardReportStatus, BoardReportVisibility } from "@xceliqos/shared/src/entities/board-report.entity";

@Injectable()
export class BoardReportingService {
  constructor(
    @InjectRepository(BoardReport)
    private readonly reportRepo: Repository<BoardReport>,
  ) {}

  async generate(school_id: string, dto: {
    title: string;
    report_type: BoardReportType;
    period_start: Date;
    period_end: Date;
    academic_year_id?: string;
    visibility?: BoardReportVisibility;
    data_snapshot?: Record<string, any>;
    ai_narrative?: string;
  }, created_by: string): Promise<BoardReport> {
    const report = this.reportRepo.create({
      ...dto,
      school_id,
      status: BoardReportStatus.DRAFT,
      generated_by: created_by,
      created_by,
      data_snapshot: dto.data_snapshot ?? {},
      visibility: dto.visibility ?? BoardReportVisibility.BOARD_ONLY,
    } as unknown as BoardReport);
    return this.reportRepo.save(report);
  }

  async list(school_id: string, filters?: {
    report_type?: BoardReportType;
    status?: BoardReportStatus;
    academic_year_id?: string;
  }): Promise<BoardReport[]> {
    const where: any = { school_id };
    if (filters?.report_type) where.report_type = filters.report_type;
    if (filters?.status) where.status = filters.status;
    if (filters?.academic_year_id) where.academic_year_id = filters.academic_year_id;
    return this.reportRepo.find({ where, order: { created_at: "DESC" } });
  }

  async getOne(school_id: string, id: string): Promise<BoardReport> {
    const report = await this.reportRepo.findOne({ where: { id, school_id } });
    if (!report) throw new NotFoundException("Board report not found");
    return report;
  }

  async update(school_id: string, id: string, dto: Partial<BoardReport>, updated_by: string): Promise<BoardReport> {
    const report = await this.getOne(school_id, id);
    Object.assign(report, { ...dto, updated_by });
    return this.reportRepo.save(report);
  }

  async publish(school_id: string, id: string, updated_by: string): Promise<BoardReport> {
    const report = await this.getOne(school_id, id);
    report.status = BoardReportStatus.PUBLISHED;
    report.updated_by = updated_by;
    return this.reportRepo.save(report);
  }

  async archive(school_id: string, id: string, updated_by: string): Promise<BoardReport> {
    const report = await this.getOne(school_id, id);
    report.status = BoardReportStatus.ARCHIVED;
    report.updated_by = updated_by;
    return this.reportRepo.save(report);
  }

  async approve(school_id: string, id: string, approved_by: string): Promise<BoardReport> {
    const report = await this.getOne(school_id, id);
    report.approved_by = approved_by;
    report.approved_at = new Date();
    report.updated_by = approved_by;
    return this.reportRepo.save(report);
  }
}
