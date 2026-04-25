import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LearningDNAProfile, DNAProfileStatus } from "@xceliqos/shared/src/entities/learning-dna-profile.entity";
import { LearningDNAObservation } from "@xceliqos/shared/src/entities/learning-dna-observation.entity";
import { ChronobioConfig } from "@xceliqos/shared/src/entities/chronobio-config.entity";
import { CognitiveLoadRule } from "@xceliqos/shared/src/entities/cognitive-load-rule.entity";

@Injectable()
export class LearningDNAService {
  constructor(
    @InjectRepository(LearningDNAProfile) private profileRepo: Repository<LearningDNAProfile>,
    @InjectRepository(LearningDNAObservation) private observationRepo: Repository<LearningDNAObservation>,
    @InjectRepository(ChronobioConfig) private chronobioRepo: Repository<ChronobioConfig>,
    @InjectRepository(CognitiveLoadRule) private loadRuleRepo: Repository<CognitiveLoadRule>,
  ) {}

  // ── Profile ───────────────────────────────────────────────────────────────

  async getProfile(schoolId: string, studentId: string, academicYearId: string): Promise<LearningDNAProfile> {
    const profile = await this.profileRepo.findOne({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    if (!profile) throw new NotFoundException("Learning DNA profile not found");
    return profile;
  }

  async getOrCreateProfile(schoolId: string, studentId: string, academicYearId: string): Promise<LearningDNAProfile> {
    const existing = await this.profileRepo.findOne({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    if (existing) return existing;
    const created = this.profileRepo.create({
      school_id: schoolId,
      student_id: studentId,
      academic_year_id: academicYearId,
      status: DNAProfileStatus.DRAFT,
      gardner_scores: {},
      dominant_intelligences: [],
      modality_preferences: [],
      observation_count: 0,
    } as any) as unknown as LearningDNAProfile;
    return this.profileRepo.save(created) as unknown as LearningDNAProfile;
  }

  async getProfiles(schoolId: string, academicYearId: string, classId?: string): Promise<LearningDNAProfile[]> {
    const qb = this.profileRepo.createQueryBuilder("p")
      .where("p.school_id = :schoolId", { schoolId })
      .andWhere("p.academic_year_id = :academicYearId", { academicYearId })
      .andWhere("p.deleted_at IS NULL");
    return qb.orderBy("p.updated_at", "DESC").getMany() as any;
  }

  async approveNarrative(schoolId: string, id: string, reviewerId: string): Promise<LearningDNAProfile> {
    const profile = await this.profileRepo.findOne({ where: { id, school_id: schoolId } });
    if (!profile) throw new NotFoundException("Profile not found");
    profile.narrative_approved = true;
    profile.reviewed_by = reviewerId;
    profile.reviewed_at = new Date();
    profile.status = DNAProfileStatus.REVIEWED;
    return this.profileRepo.save(profile) as unknown as LearningDNAProfile;
  }

  // ── Observations ──────────────────────────────────────────────────────────

  async addObservation(schoolId: string, dto: any): Promise<LearningDNAObservation> {
    const obs = this.observationRepo.create({ school_id: schoolId, ...dto } as any) as unknown as LearningDNAObservation;
    const saved = await this.observationRepo.save(obs) as unknown as LearningDNAObservation;
    // Recompute profile after each new observation
    await this.recomputeProfile(schoolId, dto.student_id, dto.academic_year_id);
    return saved;
  }

  async getObservations(schoolId: string, studentId: string, academicYearId: string, dimension?: string): Promise<LearningDNAObservation[]> {
    const qb = this.observationRepo.createQueryBuilder("o")
      .where("o.school_id = :schoolId", { schoolId })
      .andWhere("o.student_id = :studentId", { studentId })
      .andWhere("o.academic_year_id = :academicYearId", { academicYearId })
      .andWhere("o.deleted_at IS NULL");
    if (dimension) qb.andWhere("o.intelligence_dimension = :dimension", { dimension });
    return qb.orderBy("o.created_at", "DESC").getMany() as any;
  }

  // ── Profile Computation ───────────────────────────────────────────────────

  async recomputeProfile(schoolId: string, studentId: string, academicYearId: string): Promise<LearningDNAProfile> {
    const profile = await this.getOrCreateProfile(schoolId, studentId, academicYearId);
    const observations = await this.observationRepo.find({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });

    // Aggregate Gardner scores — weighted average by confidence
    const dimensionMap: Record<string, { weightedSum: number; weightSum: number }> = {};
    let totalIntrinsic = 0; let totalExtraneous = 0; let loadCount = 0;

    for (const obs of observations) {
      const dim = obs.intelligence_dimension;
      if (!dimensionMap[dim]) dimensionMap[dim] = { weightedSum: 0, weightSum: 0 };
      const conf = Number(obs.confidence) || 1.0;
      dimensionMap[dim].weightedSum += Number(obs.signal_strength) * conf;
      dimensionMap[dim].weightSum += conf;
      if (obs.intrinsic_load != null) { totalIntrinsic += Number(obs.intrinsic_load); loadCount++; }
      if (obs.extraneous_load != null) { totalExtraneous += Number(obs.extraneous_load); loadCount++; }
    }

    const gardnerScores: Record<string, number> = {};
    for (const [dim, { weightedSum, weightSum }] of Object.entries(dimensionMap)) {
      gardnerScores[dim] = weightSum > 0 ? Math.round((weightedSum / weightSum) * 100) / 100 : 0;
    }

    // Dominant intelligences — top 3 by score
    const dominant = Object.entries(gardnerScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([dim]) => dim);

    // Cognitive load index — average of intrinsic + extraneous
    const cognitiveLoadIndex = loadCount > 0
      ? Math.round(((totalIntrinsic + totalExtraneous) / loadCount) * 100) / 100
      : null;

    // Status progression
    let status = DNAProfileStatus.DRAFT;
    if (observations.length >= 6) status = DNAProfileStatus.ESTABLISHED;
    else if (observations.length >= 3) status = DNAProfileStatus.PROVISIONAL;
    if (profile.status === DNAProfileStatus.REVIEWED) status = DNAProfileStatus.REVIEWED;

    Object.assign(profile, {
      gardner_scores: gardnerScores,
      dominant_intelligences: dominant,
      cognitive_load_index: cognitiveLoadIndex,
      observation_count: observations.length,
      status,
      last_computed_at: new Date(),
    });

    // Mark all observations as aggregated
    await this.observationRepo.createQueryBuilder()
      .update()
      .set({ aggregated: true, aggregated_at: new Date() })
      .where("school_id = :schoolId AND student_id = :studentId AND academic_year_id = :academicYearId", {
        schoolId, studentId, academicYearId,
      })
      .execute();

    return this.profileRepo.save(profile) as unknown as LearningDNAProfile;
  }

  // ── Chronobio ─────────────────────────────────────────────────────────────

  async getChronobioConfig(schoolId: string, studentId?: string): Promise<ChronobioConfig> {
    // Student-specific first, fall back to school default
    if (studentId) {
      const studentConfig = await this.chronobioRepo.findOne({
        where: { school_id: schoolId, student_id: studentId },
      });
      if (studentConfig) return studentConfig;
    }
    const schoolDefault = await this.chronobioRepo.findOne({
      where: { school_id: schoolId, student_id: null as any },
    });
    if (schoolDefault) return schoolDefault;
    throw new NotFoundException("No chronobio config found");
  }

  async upsertChronobioConfig(schoolId: string, dto: any): Promise<ChronobioConfig> {
    const studentId = dto.student_id || null;
    const existing = await this.chronobioRepo.findOne({
      where: { school_id: schoolId, student_id: studentId },
    });
    if (existing) {
      Object.assign(existing, dto);
      return this.chronobioRepo.save(existing) as unknown as ChronobioConfig;
    }
    const created = this.chronobioRepo.create({ school_id: schoolId, ...dto } as any) as unknown as ChronobioConfig;
    return this.chronobioRepo.save(created) as unknown as ChronobioConfig;
  }

  async approveChronobioConfig(schoolId: string, id: string, approverId: string): Promise<ChronobioConfig> {
    const config = await this.chronobioRepo.findOne({ where: { id, school_id: schoolId } });
    if (!config) throw new NotFoundException("Chronobio config not found");
    config.is_approved = true;
    config.approved_by = approverId;
    config.approved_at = new Date();
    return this.chronobioRepo.save(config) as unknown as ChronobioConfig;
  }

  // ── Cognitive Load Rules ──────────────────────────────────────────────────

  async createLoadRule(schoolId: string, dto: any): Promise<CognitiveLoadRule> {
    const rule = this.loadRuleRepo.create({ school_id: schoolId, ...dto } as any) as unknown as CognitiveLoadRule;
    return this.loadRuleRepo.save(rule) as unknown as CognitiveLoadRule;
  }

  async getLoadRules(schoolId: string): Promise<CognitiveLoadRule[]> {
    return this.loadRuleRepo.find({ where: { school_id: schoolId, is_active: true } }) as any;
  }

  async updateLoadRule(schoolId: string, id: string, dto: any): Promise<CognitiveLoadRule> {
    const rule = await this.loadRuleRepo.findOne({ where: { id, school_id: schoolId } });
    if (!rule) throw new NotFoundException("Cognitive load rule not found");
    Object.assign(rule, dto);
    return this.loadRuleRepo.save(rule) as unknown as CognitiveLoadRule;
  }

  // ── Class-level summary for teacher dashboard ─────────────────────────────

  async getClassDNASummary(schoolId: string, academicYearId: string): Promise<Record<string, any>> {
    const profiles = await this.profileRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });
    const total = profiles.length;
    if (total === 0) return { total: 0, dominant_distribution: {}, status_distribution: {} };

    const dominantDist: Record<string, number> = {};
    const statusDist: Record<string, number> = {};

    for (const p of profiles) {
      const top = p.dominant_intelligences?.[0];
      if (top) dominantDist[top] = (dominantDist[top] || 0) + 1;
      statusDist[p.status] = (statusDist[p.status] || 0) + 1;
    }

    return { total, dominant_distribution: dominantDist, status_distribution: statusDist };
  }
}
