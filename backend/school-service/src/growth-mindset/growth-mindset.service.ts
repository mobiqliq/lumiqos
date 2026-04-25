import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MindsetMoment, MindsetMomentType } from "@xceliqos/shared/src/entities/mindset-moment.entity";
import { ParentMindsetProgress } from "@xceliqos/shared/src/entities/parent-mindset-progress.entity";

@Injectable()
export class GrowthMindsetService {
  constructor(
    @InjectRepository(MindsetMoment)
    private readonly momentRepo: Repository<MindsetMoment>,
    @InjectRepository(ParentMindsetProgress)
    private readonly progressRepo: Repository<ParentMindsetProgress>,
  ) {}

  // ── Mindset Moments ──────────────────────────────────────────────────────

  async createMoment(school_id: string, dto: {
    student_id: string;
    teacher_id?: string;
    moment_type: MindsetMomentType;
    context?: string;
    growth_language?: string;
    linked_subject_id?: string;
    linked_assessment_id?: string;
  }, created_by: string): Promise<MindsetMoment> {
    const moment = this.momentRepo.create({
      ...dto,
      school_id,
      shared_with_parent: false,
      teacher_id: dto.teacher_id ?? created_by,
      created_by,
    } as unknown as MindsetMoment);
    return this.momentRepo.save(moment);
  }

  async listMoments(school_id: string, student_id: string, filters?: {
    moment_type?: MindsetMomentType;
    shared_with_parent?: boolean;
  }): Promise<MindsetMoment[]> {
    const where: any = { school_id, student_id };
    if (filters?.moment_type) where.moment_type = filters.moment_type;
    if (filters?.shared_with_parent !== undefined) where.shared_with_parent = filters.shared_with_parent;
    return this.momentRepo.find({ where, order: { created_at: "DESC" } });
  }

  async getMoment(school_id: string, id: string): Promise<MindsetMoment> {
    const moment = await this.momentRepo.findOne({ where: { id, school_id } });
    if (!moment) throw new NotFoundException("Mindset moment not found");
    return moment;
  }

  async shareWithParent(school_id: string, id: string, updated_by: string): Promise<MindsetMoment> {
    const moment = await this.getMoment(school_id, id);
    moment.shared_with_parent = true;
    moment.shared_at = new Date();
    moment.updated_by = updated_by;
    const saved = await this.momentRepo.save(moment);
    await this.refreshParentProgress(school_id, moment.student_id);
    return saved;
  }

  async updateMoment(school_id: string, id: string, dto: Partial<MindsetMoment>, updated_by: string): Promise<MindsetMoment> {
    const moment = await this.getMoment(school_id, id);
    Object.assign(moment, { ...dto, updated_by });
    return this.momentRepo.save(moment);
  }

  // ── Parent Mindset Progress ──────────────────────────────────────────────

  async getParentProgress(school_id: string, student_id: string, academic_year_id?: string): Promise<ParentMindsetProgress | null> {
    const where: any = { school_id, student_id };
    if (academic_year_id) where.academic_year_id = academic_year_id;
    return this.progressRepo.findOne({ where });
  }

  async upsertParentProgress(school_id: string, dto: {
    student_id: string;
    parent_id?: string;
    academic_year_id?: string;
    summary?: string;
    ai_narrative?: string;
  }, updated_by: string): Promise<ParentMindsetProgress> {
    const where: any = { school_id, student_id: dto.student_id };
    if (dto.academic_year_id) where.academic_year_id = dto.academic_year_id;
    const existing = await this.progressRepo.findOne({ where });
    if (existing) {
      Object.assign(existing, { ...dto, last_updated: new Date(), updated_by });
      return this.progressRepo.save(existing);
    }
    const progress = this.progressRepo.create({
      ...dto,
      school_id,
      moments_count: 0,
      last_updated: new Date(),
      created_by: updated_by,
      updated_by,
    } as unknown as ParentMindsetProgress);
    return this.progressRepo.save(progress);
  }

  private async refreshParentProgress(school_id: string, student_id: string): Promise<void> {
    const count = await this.momentRepo.count({ where: { school_id, student_id, shared_with_parent: true } });
    const existing = await this.progressRepo.findOne({ where: { school_id, student_id } });
    if (existing) {
      existing.moments_count = count;
      existing.last_updated = new Date();
      await this.progressRepo.save(existing);
    }
  }
}
