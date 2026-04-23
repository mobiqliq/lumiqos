import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XceliQScore } from '@xceliqos/shared/src/entities/xceliq-score.entity';
import { XceliQScoreDimension, DEFAULT_DIMENSION_WEIGHTS } from '@xceliqos/shared/src/entities/xceliq-score-dimension.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';

@Injectable()
export class XceliQScoreService {
    constructor(
        @InjectRepository(XceliQScore)
        private readonly scoreRepo: Repository<XceliQScore>,
        @InjectRepository(XceliQScoreDimension)
        private readonly dimensionRepo: Repository<XceliQScoreDimension>,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) {}

    // --- Dimension Config ---
    async getDimensionConfig(school_id: string, academic_year_id: string) {
        let config = await this.dimensionRepo.findOne({ where: { school_id, academic_year_id } });
        if (!config) {
            config = await this.dimensionRepo.save(this.dimensionRepo.create({
                school_id,
                academic_year_id,
                weights: DEFAULT_DIMENSION_WEIGHTS,
                dimension_labels: {},
                enabled_dimensions: {},
            }));
        }
        return config;
    }

    async upsertDimensionConfig(school_id: string, dto: Partial<XceliQScoreDimension>) {
        const existing = await this.dimensionRepo.findOne({
            where: { school_id, academic_year_id: dto.academic_year_id },
        });
        if (existing) {
            // Validate weights sum to 100
            if (dto.weights) {
                const total = Object.values(dto.weights).reduce((a, b) => a + b, 0);
                if (Math.abs(total - 100) > 0.01) {
                    throw new Error(`Dimension weights must sum to 100. Got ${total}`);
                }
            }
            Object.assign(existing, dto);
            return this.dimensionRepo.save(existing);
        }
        return this.dimensionRepo.save(this.dimensionRepo.create({ ...dto, school_id }));
    }

    // --- Score ---
    async getScore(school_id: string, student_id: string, academic_year_id: string) {
        const student = await this.studentRepo.findOne({ where: { id: student_id, school_id } });
        if (!student) throw new NotFoundException(`Student ${student_id} not found`);

        let score = await this.scoreRepo.findOne({ where: { school_id, student_id, academic_year_id } });
        if (!score) {
            score = await this.scoreRepo.save(this.scoreRepo.create({
                school_id,
                student_id,
                academic_year_id,
                composite_score: 0,
                dimension_scores: {
                    academic_mastery: 0,
                    learning_agility: 0,
                    homework_integrity: 0,
                    home_engagement: 0,
                    punctuality_discipline: 0,
                    co_curricular_engagement: 0,
                    collaborative_intelligence: 0,
                    self_management_sel: 0,
                    civic_community: 0,
                    wellbeing_growth_mindset: 0,
                },
            }));
        }
        return score;
    }

    async calculateScore(
        school_id: string,
        student_id: string,
        academic_year_id: string,
        dimension_scores: Record<string, number>,
        dimension_evidence?: Record<string, string>,
    ) {
        const student = await this.studentRepo.findOne({ where: { id: student_id, school_id } });
        if (!student) throw new NotFoundException(`Student ${student_id} not found`);

        const config = await this.getDimensionConfig(school_id, academic_year_id);
        const weights = config.weights;

        // Weighted composite calculation
        let composite = 0;
        for (const [dim, weight] of Object.entries(weights)) {
            const score = dimension_scores[dim] ?? 0;
            composite += (score * weight) / 100;
        }
        composite = Math.round(composite * 100) / 100;

        let existingScore = await this.scoreRepo.findOne({ where: { school_id, student_id, academic_year_id } });

        const previous = existingScore?.composite_score ?? null;
        const growth_delta = previous !== null ? composite - Number(previous) : null;

        // Growth Mindset narrative
        const growth_narrative = this.generateNarrative(composite, growth_delta, student.first_name);

        if (existingScore) {
            existingScore.previous_composite_score = existingScore.composite_score;
            existingScore.composite_score = composite;
            existingScore.growth_delta = growth_delta as any;
            existingScore.dimension_scores = dimension_scores as any;
            existingScore.dimension_evidence = dimension_evidence || {};
            existingScore.growth_narrative = growth_narrative;
            existingScore.last_calculated_at = new Date();
            return this.scoreRepo.save(existingScore);
        }

        return this.scoreRepo.save(this.scoreRepo.create({
            school_id,
            student_id,
            academic_year_id,
            composite_score: composite,
            previous_composite_score: null as any,
            growth_delta: null as any,
            dimension_scores: dimension_scores as any,
            dimension_evidence: dimension_evidence || {},
            growth_narrative,
            last_calculated_at: new Date(),
        }));
    }

    private generateNarrative(composite: number, delta: number | null, first_name: string): string {
        if (delta === null) {
            return `${first_name} is beginning their XceliQOS journey with a score of ${composite}. Every step forward counts.`;
        }
        if (delta > 0) {
            return `${first_name} has grown by ${delta.toFixed(1)} points — effort is building momentum. Current score: ${composite}.`;
        }
        if (delta < 0) {
            return `${first_name} has not yet reached their previous level — this is a learning opportunity. Current score: ${composite}. Keep going.`;
        }
        return `${first_name} is holding steady at ${composite}. Consistency is the foundation of growth.`;
    }
}
