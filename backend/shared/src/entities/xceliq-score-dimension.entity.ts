import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export const DEFAULT_DIMENSION_WEIGHTS = {
    academic_mastery:          25,
    learning_agility:          10,
    homework_integrity:        10,
    home_engagement:            8,
    punctuality_discipline:     7,
    co_curricular_engagement:  10,
    collaborative_intelligence: 8,
    self_management_sel:        7,
    civic_community:            5,
    wellbeing_growth_mindset:  10,
};

@Entity('xceliq_score_dimension')
@Index(['school_id', 'academic_year_id'], { unique: true })
export class XceliQScoreDimension extends XceliQosBaseEntity {
    @Column({ type: 'uuid' })
    academic_year_id: string;

    @Column({ type: 'jsonb', default: DEFAULT_DIMENSION_WEIGHTS })
    weights: {
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
    dimension_labels: Record<string, string>; // school can rename dimensions

    @Column({ type: 'jsonb', default: {} })
    enabled_dimensions: Record<string, boolean>; // school can disable dimensions

    @Column({ type: 'boolean', default: false })
    is_published: boolean;

    @Column({ type: 'timestamp', nullable: true })
    published_at: Date;
}
