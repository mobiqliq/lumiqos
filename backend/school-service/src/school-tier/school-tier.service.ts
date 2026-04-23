import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolTierConfig, SchoolTier } from '@xceliqos/shared/src/entities/school-tier-config.entity';
import { RoleBundle } from '@xceliqos/shared/src/entities/role-bundle.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';

const DEFAULT_BUNDLES = [
    {
        bundle_id: 'principal_admin',
        label: 'Principal + Administrator',
        tier: SchoolTier.TIER_2,
        roles_included: ['principal', 'administrator'],
        primary_role: 'principal',
        unified_dashboard: true,
        priority_queue_enabled: false,
        hidden_nav_items: [],
    },
    {
        bundle_id: 'finance_hr',
        label: 'Finance + HR',
        tier: SchoolTier.TIER_2,
        roles_included: ['finance', 'hr'],
        primary_role: 'finance',
        unified_dashboard: true,
        priority_queue_enabled: false,
        hidden_nav_items: [],
    },
    {
        bundle_id: 'solo',
        label: 'Solo Mode — Single Command Center',
        tier: SchoolTier.TIER_3,
        roles_included: ['principal', 'administrator', 'finance', 'hr'],
        primary_role: 'principal',
        unified_dashboard: true,
        priority_queue_enabled: true,
        hidden_nav_items: [],
    },
];

@Injectable()
export class SchoolTierService {
    constructor(
        @InjectRepository(SchoolTierConfig)
        private readonly tierRepo: Repository<SchoolTierConfig>,
        @InjectRepository(RoleBundle)
        private readonly bundleRepo: Repository<RoleBundle>,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) {}

    private detectTier(student_count: number): SchoolTier {
        if (student_count >= 500) return SchoolTier.TIER_1;
        if (student_count >= 150) return SchoolTier.TIER_2;
        return SchoolTier.TIER_3;
    }

    async getTierConfig(school_id: string): Promise<SchoolTierConfig> {
        let config = await this.tierRepo.findOne({ where: { school_id } });
        if (!config) {
            const student_count = await this.studentRepo.count({ where: { school_id } });
            const tier = this.detectTier(student_count);
            config = await this.tierRepo.save(this.tierRepo.create({
                school_id,
                tier,
                student_count,
                auto_detect_tier: true,
                solo_mode_enabled: tier === SchoolTier.TIER_3,
                active_bundles: tier === SchoolTier.TIER_3 ? ['solo'] :
                                tier === SchoolTier.TIER_2 ? ['principal_admin', 'finance_hr'] : [],
            }));
        }
        return config;
    }

    async upsertTierConfig(school_id: string, dto: Partial<SchoolTierConfig>): Promise<SchoolTierConfig> {
        const existing = await this.tierRepo.findOne({ where: { school_id } });
        if (existing) {
            if (dto.auto_detect_tier) {
                const student_count = await this.studentRepo.count({ where: { school_id } });
                dto.tier = this.detectTier(student_count);
                dto.student_count = student_count;
                dto.solo_mode_enabled = dto.tier === SchoolTier.TIER_3;
            }
            Object.assign(existing, dto);
            return this.tierRepo.save(existing);
        }
        return this.tierRepo.save(this.tierRepo.create({ ...dto, school_id }));
    }

    async getPriorityQueue(school_id: string) {
        const config = await this.getTierConfig(school_id);
        return {
            tier: config.tier,
            solo_mode_enabled: config.solo_mode_enabled,
            priority_queue: config.priority_queue,
        };
    }

    async getBundles(school_id: string) {
        let bundles = await this.bundleRepo.find({ where: { school_id, is_active: true } });
        if (bundles.length === 0) {
            // Seed default bundles for this school
            for (const b of DEFAULT_BUNDLES) {
                await this.bundleRepo.save(this.bundleRepo.create({ ...b, school_id }));
            }
            bundles = await this.bundleRepo.find({ where: { school_id, is_active: true } });
        }
        return bundles;
    }

    async upsertBundle(school_id: string, dto: Partial<RoleBundle>): Promise<RoleBundle> {
        const existing = await this.bundleRepo.findOne({
            where: { school_id, bundle_id: dto.bundle_id },
        });
        if (existing) {
            Object.assign(existing, dto);
            return this.bundleRepo.save(existing);
        }
        return this.bundleRepo.save(this.bundleRepo.create({ ...dto, school_id }));
    }
}
