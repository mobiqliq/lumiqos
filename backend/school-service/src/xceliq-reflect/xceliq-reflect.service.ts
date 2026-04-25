import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReflectionEntry, ReflectionType, ReflectionVisibility } from "@xceliqos/shared/src/entities/reflection-entry.entity";
import { MetacognitiveScore, MetacognitiveDimension } from "@xceliqos/shared/src/entities/metacognitive-score.entity";

@Injectable()
export class XceliQReflectService {
  constructor(
    @InjectRepository(ReflectionEntry)
    private readonly entryRepo: Repository<ReflectionEntry>,
    @InjectRepository(MetacognitiveScore)
    private readonly scoreRepo: Repository<MetacognitiveScore>,
  ) {}

  // ── Reflection Entries ───────────────────────────────────────────────────

  async createEntry(school_id: string, dto: {
    student_id: string;
    academic_year_id?: string;
    prompt_id?: string;
    prompt_text?: string;
    response: string;
    reflection_type?: ReflectionType;
    visibility?: ReflectionVisibility;
  }, created_by: string): Promise<ReflectionEntry> {
    const word_count = dto.response.trim().split(/\s+/).filter(Boolean).length;
    const entry = this.entryRepo.create({
      ...dto,
      school_id,
      word_count,
      submitted_at: new Date(),
      reflection_type: dto.reflection_type ?? ReflectionType.GUIDED,
      visibility: dto.visibility ?? ReflectionVisibility.TEACHER,
      created_by,
    } as unknown as ReflectionEntry);
    return this.entryRepo.save(entry);
  }

  async listEntries(school_id: string, filters?: {
    student_id?: string;
    academic_year_id?: string;
    reflection_type?: ReflectionType;
    visibility?: ReflectionVisibility;
  }): Promise<ReflectionEntry[]> {
    const where: any = { school_id };
    if (filters?.student_id) where.student_id = filters.student_id;
    if (filters?.academic_year_id) where.academic_year_id = filters.academic_year_id;
    if (filters?.reflection_type) where.reflection_type = filters.reflection_type;
    if (filters?.visibility) where.visibility = filters.visibility;
    return this.entryRepo.find({ where, order: { submitted_at: "DESC" } });
  }

  async getEntry(school_id: string, id: string): Promise<ReflectionEntry> {
    const entry = await this.entryRepo.findOne({ where: { id, school_id } });
    if (!entry) throw new NotFoundException("Reflection entry not found");
    return entry;
  }

  async addAiFeedback(school_id: string, id: string, ai_feedback: string, updated_by: string): Promise<ReflectionEntry> {
    const entry = await this.getEntry(school_id, id);
    entry.ai_feedback = ai_feedback;
    entry.updated_by = updated_by;
    return this.entryRepo.save(entry);
  }

  // ── Metacognitive Scores ─────────────────────────────────────────────────

  async createScore(school_id: string, dto: {
    student_id: string;
    academic_year_id?: string;
    dimension: MetacognitiveDimension;
    score: number;
    evidence_ref?: string;
    assessed_by?: string;
  }, created_by: string): Promise<MetacognitiveScore> {
    if (dto.score < 0 || dto.score > 100) {
      throw new BadRequestException("Score must be between 0 and 100");
    }
    const score = this.scoreRepo.create({
      ...dto,
      school_id,
      assessed_at: new Date(),
      assessed_by: dto.assessed_by ?? created_by,
      created_by,
    } as unknown as MetacognitiveScore);
    return this.scoreRepo.save(score);
  }

  async getScoresByStudent(school_id: string, student_id: string, academic_year_id?: string): Promise<MetacognitiveScore[]> {
    const where: any = { school_id, student_id };
    if (academic_year_id) where.academic_year_id = academic_year_id;
    return this.scoreRepo.find({ where, order: { assessed_at: "DESC" } });
  }

  async getScore(school_id: string, id: string): Promise<MetacognitiveScore> {
    const score = await this.scoreRepo.findOne({ where: { id, school_id } });
    if (!score) throw new NotFoundException("Metacognitive score not found");
    return score;
  }

  async updateScore(school_id: string, id: string, dto: Partial<MetacognitiveScore>, updated_by: string): Promise<MetacognitiveScore> {
    const score = await this.getScore(school_id, id);
    if (dto.score !== undefined && (dto.score < 0 || dto.score > 100)) {
      throw new BadRequestException("Score must be between 0 and 100");
    }
    Object.assign(score, { ...dto, updated_by });
    return this.scoreRepo.save(score);
  }
}
