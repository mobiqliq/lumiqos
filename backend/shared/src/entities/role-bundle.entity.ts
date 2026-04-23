import { Entity, Column, Index } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';
import { SchoolTier } from './school-tier-config.entity';

@Entity('role_bundle')
@Index(['school_id', 'bundle_id'], { unique: true })
export class RoleBundle extends XceliQosBaseEntity {
    @Column({ type: 'varchar' })
    bundle_id: string; // e.g. 'principal_admin', 'solo'

    @Column({ type: 'varchar' })
    label: string; // e.g. 'Principal + Administrator'

    @Column({
        type: 'enum',
        enum: SchoolTier,
    })
    tier: SchoolTier;

    @Column({ type: 'jsonb', default: [] })
    roles_included: string[]; // role_id values bundled together

    @Column({ type: 'varchar' })
    primary_role: string; // role_id of the primary persona shown in UI

    @Column({ type: 'boolean', default: true })
    unified_dashboard: boolean; // show merged dashboard view

    @Column({ type: 'boolean', default: false })
    priority_queue_enabled: boolean; // show Smart Priority Queue

    @Column({ type: 'jsonb', default: [] })
    hidden_nav_items: string[]; // nav items hidden in this bundle mode

    @Column({ type: 'boolean', default: true })
    is_active: boolean;
}
