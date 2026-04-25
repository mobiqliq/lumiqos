import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { SchoolGroup, SchoolGroupType } from "@xceliqos/shared/src/entities/school-group.entity";
import { SchoolGroupMember, SchoolGroupMemberType, SchoolGroupMemberRole } from "@xceliqos/shared/src/entities/school-group-member.entity";
import { SchoolGroupConfig } from "@xceliqos/shared/src/entities/school-group-config.entity";

@Injectable()
export class SchoolGroupService {
  constructor(
    @InjectRepository(SchoolGroup)
    private readonly groupRepo: Repository<SchoolGroup>,
    @InjectRepository(SchoolGroupMember)
    private readonly memberRepo: Repository<SchoolGroupMember>,
    @InjectRepository(SchoolGroupConfig)
    private readonly configRepo: Repository<SchoolGroupConfig>,
  ) {}

  // ── Config ──────────────────────────────────────────────────────────────

  async getConfig(school_id: string): Promise<SchoolGroupConfig> {
    const config = await this.configRepo.findOne({ where: { school_id } });
    if (config) return config;
    const created = this.configRepo.create({ school_id } as unknown as SchoolGroupConfig);
    return this.configRepo.save(created);
  }

  async updateConfig(school_id: string, dto: Partial<SchoolGroupConfig>): Promise<SchoolGroupConfig> {
    const config = await this.getConfig(school_id);
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  // ── Groups ───────────────────────────────────────────────────────────────

  async createGroup(school_id: string, dto: Partial<SchoolGroup>, created_by: string): Promise<SchoolGroup> {
    // Enforce max subgroup depth
    if (dto.parent_group_id) {
      const config = await this.getConfig(school_id);
      const parent = await this.groupRepo.findOne({ where: { id: dto.parent_group_id, school_id } });
      if (!parent) throw new NotFoundException("Parent group not found");
      if (parent.parent_group_id) {
        const depth = config.max_subgroup_depth ?? 2;
        if (depth < 2) throw new BadRequestException("Max subgroup depth exceeded");
      }
    }
    const group = this.groupRepo.create({ ...dto, school_id, created_by } as unknown as SchoolGroup);
    return this.groupRepo.save(group);
  }

  async listGroups(school_id: string, group_type?: SchoolGroupType, academic_year_id?: string): Promise<SchoolGroup[]> {
    const where: any = { school_id, is_active: true };
    if (group_type) where.group_type = group_type;
    if (academic_year_id) where.academic_year_id = academic_year_id;
    return this.groupRepo.find({ where });
  }

  async getGroup(school_id: string, id: string): Promise<SchoolGroup> {
    const group = await this.groupRepo.findOne({ where: { id, school_id } });
    if (!group) throw new NotFoundException("Group not found");
    return group;
  }

  async updateGroup(school_id: string, id: string, dto: Partial<SchoolGroup>, updated_by: string): Promise<SchoolGroup> {
    const group = await this.getGroup(school_id, id);
    Object.assign(group, { ...dto, updated_by });
    return this.groupRepo.save(group);
  }

  async listSubgroups(school_id: string, parent_group_id: string): Promise<SchoolGroup[]> {
    return this.groupRepo.find({ where: { school_id, parent_group_id, is_active: true } });
  }

  // ── Members ──────────────────────────────────────────────────────────────

  async addMember(school_id: string, group_id: string, dto: Partial<SchoolGroupMember>, created_by: string): Promise<SchoolGroupMember> {
    await this.getGroup(school_id, group_id);
    const existing = await this.memberRepo.findOne({
      where: { school_id, group_id, member_id: dto.member_id, exited_at: IsNull() },
    });
    if (existing) throw new BadRequestException("Member already active in this group");
    const member = this.memberRepo.create({
      ...dto,
      school_id,
      group_id,
      joined_at: new Date(),
      created_by,
    } as unknown as SchoolGroupMember);
    return this.memberRepo.save(member);
  }

  async listMembers(school_id: string, group_id: string): Promise<SchoolGroupMember[]> {
    await this.getGroup(school_id, group_id);
    return this.memberRepo.find({ where: { school_id, group_id, exited_at: IsNull() } });
  }

  async updateMemberRole(school_id: string, group_id: string, member_id: string, role: SchoolGroupMemberRole, updated_by: string): Promise<SchoolGroupMember> {
    const member = await this.memberRepo.findOne({ where: { school_id, group_id, member_id, exited_at: IsNull() } });
    if (!member) throw new NotFoundException("Active member not found");
    member.role = role;
    member.updated_by = updated_by;
    return this.memberRepo.save(member);
  }

  async removeMember(school_id: string, group_id: string, member_id: string, exit_reason: string, updated_by: string): Promise<SchoolGroupMember> {
    const member = await this.memberRepo.findOne({ where: { school_id, group_id, member_id, exited_at: IsNull() } });
    if (!member) throw new NotFoundException("Active member not found");
    member.exited_at = new Date();
    member.exit_reason = exit_reason;
    member.updated_by = updated_by;
    return this.memberRepo.save(member);
  }

  async addPoints(school_id: string, group_id: string, points: number, updated_by: string): Promise<SchoolGroup> {
    const group = await this.getGroup(school_id, group_id);
    group.points = (group.points ?? 0) + points;
    group.updated_by = updated_by;
    return this.groupRepo.save(group);
  }
}
