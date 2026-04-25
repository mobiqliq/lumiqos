import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SELObservation, SELSignalValence } from "@xceliqos/shared/src/entities/sel-observation.entity";
import { EQProfile, EQProfileStatus } from "@xceliqos/shared/src/entities/eq-profile.entity";
import { FlowStateLog } from "@xceliqos/shared/src/entities/flow-state-log.entity";
import { SELFrameworkConfig } from "@xceliqos/shared/src/entities/sel-framework-config.entity";

@Injectable()
export class SELIntelligenceService {
  constructor(
    @InjectRepository(SELObservation) private observationRepo: Repository<SELObservation>,
    @InjectRepository(EQProfile) private profileRepo: Repository<EQProfile>,
    @InjectRepository(FlowStateLog) private flowRepo: Repository<FlowStateLog>,
    @InjectRepository(SELFrameworkConfig) private configRepo: Repository<SELFrameworkConfig>,
  ) {}

  // ── Framework Config ──────────────────────────────────────────────────────

  async getFrameworkConfig(schoolId: string): Promise<SELFrameworkConfig> {
    const config = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (!config) throw new NotFoundException("SEL framework config not found — create one first");
    return config;
  }

  async upsertFrameworkConfig(schoolId: string, dto: any): Promise<SELFrameworkConfig> {
    const existing = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing) as unknown as SELFrameworkConfig;
    }
    const created = this.configRepo.create({ school_id: schoolId, ...dto } as any) as unknown as SELFrameworkConfig;
    return this.configRepo.save(created) as unknown as SELFrameworkConfig;
  }

  // ── EQ Profile ────────────────────────────────────────────────────────────

  async getOrCreateProfile(schoolId: string, studentId: string, academicYearId: string): Promise<EQProfile> {
    const existing = await this.profileRepo.findOne({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    if (existing) return existing;
    const created = this.profileRepo.create({
      school_id: schoolId,
      student_id: studentId,
      academic_year_id: academicYearId,
      status: EQProfileStatus.DRAFT,
      casel_scores: {},
      observation_count: 0,
      flow_state_event_count: 0,
    } as any) as unknown as EQProfile;
    return this.profileRepo.save(created) as unknown as EQProfile;
  }

  async getProfiles(schoolId: string, academicYearId: string): Promise<EQProfile[]> {
    return this.profileRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    }) as any;
  }

  async approveNarrative(schoolId: string, id: string, reviewerId: string): Promise<EQProfile> {
    const profile = await this.profileRepo.findOne({ where: { id, school_id: schoolId } });
    if (!profile) throw new NotFoundException("EQ profile not found");
    profile.narrative_approved = true;
    profile.reviewed_by = reviewerId;
    profile.reviewed_at = new Date();
    profile.status = EQProfileStatus.REVIEWED;
    return this.profileRepo.save(profile) as unknown as EQProfile;
  }

  // ── Observations ──────────────────────────────────────────────────────────

  async addObservation(schoolId: string, dto: any): Promise<SELObservation> {
    const obs = this.observationRepo.create({ school_id: schoolId, ...dto } as any) as unknown as SELObservation;
    const saved = await this.observationRepo.save(obs) as unknown as SELObservation;
    await this.recomputeProfile(schoolId, dto.student_id, dto.academic_year_id);
    return saved;
  }

  async getObservations(schoolId: string, studentId: string, academicYearId: string, competency?: string): Promise<SELObservation[]> {
    const qb = this.observationRepo.createQueryBuilder("o")
      .where("o.school_id = :schoolId", { schoolId })
      .andWhere("o.student_id = :studentId", { studentId })
      .andWhere("o.academic_year_id = :academicYearId", { academicYearId })
      .andWhere("o.deleted_at IS NULL");
    if (competency) qb.andWhere("o.casel_competency = :competency", { competency });
    return qb.orderBy("o.created_at", "DESC").getMany() as any;
  }

  // ── Flow State ────────────────────────────────────────────────────────────

  async logFlowState(schoolId: string, dto: any): Promise<FlowStateLog> {
    const log = this.flowRepo.create({ school_id: schoolId, ...dto } as any) as unknown as FlowStateLog;
    const saved = await this.flowRepo.save(log) as unknown as FlowStateLog;
    await this.recomputeProfile(schoolId, dto.student_id, dto.academic_year_id);
    return saved;
  }

  async getFlowLogs(schoolId: string, studentId: string, academicYearId: string): Promise<FlowStateLog[]> {
    return this.flowRepo.find({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    }) as any;
  }

  // ── Profile Computation ───────────────────────────────────────────────────

  async recomputeProfile(schoolId: string, studentId: string, academicYearId: string): Promise<EQProfile> {
    const profile = await this.getOrCreateProfile(schoolId, studentId, academicYearId);

    // Load config for thresholds
    let config: SELFrameworkConfig | null = null;
    try { config = await this.getFrameworkConfig(schoolId); } catch (_) {}
    const provisionalThreshold = config?.provisional_threshold ?? 3;
    const establishedThreshold = config?.established_threshold ?? 6;

    const observations = await this.observationRepo.find({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });

    // Aggregate CASEL 5 scores — weighted by confidence, exclude concern valence from strength score
    const competencyMap: Record<string, { weightedSum: number; weightSum: number }> = {};
    for (const obs of observations) {
      const comp = obs.casel_competency;
      if (!competencyMap[comp]) competencyMap[comp] = { weightedSum: 0, weightSum: 0 };
      const conf = Number(obs.confidence) || 1.0;
      // Concern valence contributes inversely — gap signal
      const signal = obs.valence === SELSignalValence.CONCERN
        ? Math.max(0, 50 - Number(obs.signal_strength))
        : Number(obs.signal_strength);
      competencyMap[comp].weightedSum += signal * conf;
      competencyMap[comp].weightSum += conf;
    }

    const caselScores: Record<string, number> = {};
    for (const [comp, { weightedSum, weightSum }] of Object.entries(competencyMap)) {
      caselScores[comp] = weightSum > 0 ? Math.round((weightedSum / weightSum) * 100) / 100 : 0;
    }

    // EQ index — mean of available CASEL scores
    const scoreValues = Object.values(caselScores);
    const eqIndex = scoreValues.length > 0
      ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100) / 100
      : null;

    // Top strength + growth area
    const sorted = Object.entries(caselScores).sort(([, a], [, b]) => b - a);
    const topStrength = sorted[0]?.[0] ?? null;
    const growthArea = sorted[sorted.length - 1]?.[0] ?? null;

    // Flow state index — mean confidence-weighted performance signal from flow logs
    const flowLogs = await this.flowRepo.find({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    let flowIndex: number | null = null;
    if (flowLogs.length > 0) {
      const flowSum = flowLogs.reduce((sum, f) => sum + (Number(f.performance_signal) || 50) * (Number(f.confidence) || 0.7), 0);
      const flowWeightSum = flowLogs.reduce((sum, f) => sum + (Number(f.confidence) || 0.7), 0);
      flowIndex = flowWeightSum > 0 ? Math.round((flowSum / flowWeightSum) * 100) / 100 : null;
    }

    // XceliQScore feed derivation
    const selfMgmtFeed = ((caselScores["self_management"] ?? 0) + (caselScores["self_awareness"] ?? 0)) / 2 || null;
    const collabFeed = ((caselScores["relationship_skills"] ?? 0) + (caselScores["social_awareness"] ?? 0)) / 2 || null;

    // Status progression
    let status = EQProfileStatus.DRAFT;
    if (observations.length >= establishedThreshold) status = EQProfileStatus.ESTABLISHED;
    else if (observations.length >= provisionalThreshold) status = EQProfileStatus.PROVISIONAL;
    if (profile.status === EQProfileStatus.REVIEWED) status = EQProfileStatus.REVIEWED;

    // Growth delta
    const previousEqIndex = profile.eq_index ? Number(profile.eq_index) : null;
    const eqGrowthDelta = eqIndex != null && previousEqIndex != null
      ? Math.round((eqIndex - previousEqIndex) * 100) / 100
      : null;

    Object.assign(profile, {
      casel_scores: caselScores,
      eq_index: eqIndex,
      previous_eq_index: previousEqIndex,
      eq_growth_delta: eqGrowthDelta,
      top_strength: topStrength,
      growth_area: growthArea,
      flow_state_index: flowIndex,
      flow_state_event_count: flowLogs.length,
      observation_count: observations.length,
      status,
      xceliq_self_management_sel_feed: selfMgmtFeed,
      xceliq_collaborative_intelligence_feed: collabFeed,
      last_computed_at: new Date(),
    });

    // Mark observations as aggregated
    if (observations.length > 0) {
      await this.observationRepo.createQueryBuilder()
        .update()
        .set({ aggregated: true, aggregated_at: new Date() })
        .where("school_id = :schoolId AND student_id = :studentId AND academic_year_id = :academicYearId", {
          schoolId, studentId, academicYearId,
        })
        .execute();
    }

    return this.profileRepo.save(profile) as unknown as EQProfile;
  }

  // ── Class summary ─────────────────────────────────────────────────────────

  async getClassSELSummary(schoolId: string, academicYearId: string): Promise<Record<string, any>> {
    const profiles = await this.profileRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });
    const total = profiles.length;
    if (total === 0) return { total: 0, avg_eq_index: null, competency_averages: {}, status_distribution: {} };

    const statusDist: Record<string, number> = {};
    const competencyTotals: Record<string, { sum: number; count: number }> = {};
    let eqSum = 0; let eqCount = 0;

    for (const p of profiles) {
      statusDist[p.status] = (statusDist[p.status] || 0) + 1;
      if (p.eq_index != null) { eqSum += Number(p.eq_index); eqCount++; }
      for (const [comp, score] of Object.entries(p.casel_scores as Record<string, number>)) {
        if (!competencyTotals[comp]) competencyTotals[comp] = { sum: 0, count: 0 };
        competencyTotals[comp].sum += score;
        competencyTotals[comp].count++;
      }
    }

    const competencyAverages: Record<string, number> = {};
    for (const [comp, { sum, count }] of Object.entries(competencyTotals)) {
      competencyAverages[comp] = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
    }

    return {
      total,
      avg_eq_index: eqCount > 0 ? Math.round((eqSum / eqCount) * 100) / 100 : null,
      competency_averages: competencyAverages,
      status_distribution: statusDist,
    };
  }
}
