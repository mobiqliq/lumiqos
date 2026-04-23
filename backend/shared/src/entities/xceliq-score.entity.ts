import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

@Entity('xceliq_score')
@Index(['school_id', 'student_id', 'academic_year_id'], { unique: true })
export class XceliQScore extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    student_id: string;

    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    composite_score: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    previous_composite_score: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    growth_delta: number | null; // composite_score - previous_composite_score

    @Column({ type: 'jsonb', default: {} })
    dimension_scores: {
        academic_mastery: number;
        learning_agility: number;
        homework_integrity: number;
        home_engagement: number;
        punctuality_discipline: number;
        co_curricular_engagement: number;
        collaborative_intelligence: number;
        self_management_sel: number;
        civic_community: number;
        wellbeing_growth_mindset: number;
    };

    @Column({ type: 'jsonb', default: {} })
    dimension_evidence: Record<string, string>; // dimension → evidence summary

    @Column({ type: 'varchar', nullable: true })
    growth_narrative: string; // Growth Mindset language — auto-generated

    @Column({ type: 'timestamp', nullable: true })
    last_calculated_at: Date;

    @Column({ type: 'boolean', default: false })
    is_published: boolean; // Only published scores shown to students/parents
}
