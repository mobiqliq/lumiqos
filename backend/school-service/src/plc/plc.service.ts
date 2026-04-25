import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PLCGroup } from "@xceliqos/shared/src/entities/plc-group.entity";
import { PLCSession } from "@xceliqos/shared/src/entities/plc-session.entity";
import { PLCResource, PLCResourceType } from "@xceliqos/shared/src/entities/plc-resource.entity";

@Injectable()
export class PLCService {
  constructor(
    @InjectRepository(PLCGroup)
    private readonly groupRepo: Repository<PLCGroup>,
    @InjectRepository(PLCSession)
    private readonly sessionRepo: Repository<PLCSession>,
    @InjectRepository(PLCResource)
    private readonly resourceRepo: Repository<PLCResource>,
  ) {}

  // ── PLCGroup ─────────────────────────────────────────────────────────────

  async createGroup(school_id: string, dto: {
    name: string;
    focus_area?: string;
    lead_teacher_id?: string;
    academic_year_id?: string;
    meeting_cadence?: Record<string, any>;
  }, created_by: string): Promise<PLCGroup> {
    const group = this.groupRepo.create({
      ...dto,
      school_id,
      is_active: true,
      meeting_cadence: dto.meeting_cadence ?? {},
      created_by,
    } as unknown as PLCGroup);
    return this.groupRepo.save(group);
  }

  async listGroups(school_id: string, academic_year_id?: string): Promise<PLCGroup[]> {
    const where: any = { school_id };
    if (academic_year_id) where.academic_year_id = academic_year_id;
    return this.groupRepo.find({ where, order: { created_at: "DESC" } });
  }

  async getGroup(school_id: string, id: string): Promise<PLCGroup> {
    const group = await this.groupRepo.findOne({ where: { id, school_id } });
    if (!group) throw new NotFoundException("PLC group not found");
    return group;
  }

  async updateGroup(school_id: string, id: string, dto: Partial<PLCGroup>, updated_by: string): Promise<PLCGroup> {
    const group = await this.getGroup(school_id, id);
    Object.assign(group, { ...dto, updated_by });
    return this.groupRepo.save(group);
  }

  async deleteGroup(school_id: string, id: string): Promise<void> {
    const group = await this.getGroup(school_id, id);
    await this.groupRepo.softRemove(group);
  }

  // ── PLCSession ───────────────────────────────────────────────────────────

  async createSession(school_id: string, dto: {
    plc_group_id: string;
    date: Date;
    duration_minutes?: number;
    agenda?: Record<string, any>;
    notes?: string;
    attendance?: Record<string, any>;
    action_items?: Record<string, any>;
    facilitator_id?: string;
  }, created_by: string): Promise<PLCSession> {
    await this.getGroup(school_id, dto.plc_group_id);
    const session = this.sessionRepo.create({
      ...dto,
      school_id,
      agenda: dto.agenda ?? {},
      attendance: dto.attendance ?? {},
      action_items: dto.action_items ?? [],
      created_by,
    } as unknown as PLCSession);
    return this.sessionRepo.save(session);
  }

  async listSessions(school_id: string, plc_group_id?: string): Promise<PLCSession[]> {
    const where: any = { school_id };
    if (plc_group_id) where.plc_group_id = plc_group_id;
    return this.sessionRepo.find({ where, order: { date: "DESC" } });
  }

  async getSession(school_id: string, id: string): Promise<PLCSession> {
    const session = await this.sessionRepo.findOne({ where: { id, school_id } });
    if (!session) throw new NotFoundException("PLC session not found");
    return session;
  }

  async updateSession(school_id: string, id: string, dto: Partial<PLCSession>, updated_by: string): Promise<PLCSession> {
    const session = await this.getSession(school_id, id);
    Object.assign(session, { ...dto, updated_by });
    return this.sessionRepo.save(session);
  }

  async deleteSession(school_id: string, id: string): Promise<void> {
    const session = await this.getSession(school_id, id);
    await this.sessionRepo.softRemove(session);
  }

  // ── PLCResource ──────────────────────────────────────────────────────────

  async createResource(school_id: string, dto: {
    plc_group_id: string;
    title: string;
    resource_type: PLCResourceType;
    url?: string;
    file_ref?: string;
    tags?: string[];
  }, created_by: string): Promise<PLCResource> {
    await this.getGroup(school_id, dto.plc_group_id);
    const resource = this.resourceRepo.create({
      ...dto,
      school_id,
      shared_by: created_by,
      tags: dto.tags ?? [],
      created_by,
    } as unknown as PLCResource);
    return this.resourceRepo.save(resource);
  }

  async listResources(school_id: string, plc_group_id?: string, resource_type?: PLCResourceType): Promise<PLCResource[]> {
    const where: any = { school_id };
    if (plc_group_id) where.plc_group_id = plc_group_id;
    if (resource_type) where.resource_type = resource_type;
    return this.resourceRepo.find({ where, order: { created_at: "DESC" } });
  }

  async getResource(school_id: string, id: string): Promise<PLCResource> {
    const resource = await this.resourceRepo.findOne({ where: { id, school_id } });
    if (!resource) throw new NotFoundException("PLC resource not found");
    return resource;
  }

  async updateResource(school_id: string, id: string, dto: Partial<PLCResource>, updated_by: string): Promise<PLCResource> {
    const resource = await this.getResource(school_id, id);
    Object.assign(resource, { ...dto, updated_by });
    return this.resourceRepo.save(resource);
  }

  async deleteResource(school_id: string, id: string): Promise<void> {
    const resource = await this.getResource(school_id, id);
    await this.resourceRepo.softRemove(resource);
  }
}
