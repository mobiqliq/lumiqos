import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';

export enum SchoolTier {
    TIER_1 = 'tier_1', // 500+ students — full role separation
    TIER_2 = 'tier_2', // 150-500 — role bundling
    TIER_3 = 'tier_3', // <150 — solo mode
}

@Entity('school_tier_config')
@Index(['school_id'], { unique: true })
export class SchoolTierConfig extends XceliQosBaseEntity {
    @Column({
        type: 'enum',
        enum: SchoolTier,
        default: SchoolTier.TIER_1,
    })
    tier: SchoolTier;

    @Column({ type: 'int', default: 0 })
    student_count: number;

    @Column({ type: 'boolean', default: false })
    auto_detect_tier: boolean; // if true, tier is computed from student_count

    @Column({ type: 'boolean', default: false })
    solo_mode_enabled: boolean; // Tier 3 only

    @Column({ type: 'jsonb', default: [] })
    priority_queue: {
        rank: number;
        action: string;
        module: string;
        urgency: 'critical' | 'high' | 'medium' | 'low';
        due_date: string | null;
        meta: Record<string, any>;
    }[];

    @Column({ type: 'jsonb', default: [] })
    active_bundles: string[]; // list of RoleBundle.bundle_id active for this school

    @Column({ type: 'boolean', default: false })
    ai_autonomous_routines: boolean; // Tier 3 — LumiqAI light approval mode
}
