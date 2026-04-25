import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AlumniRecord, AlumniStatus, AlumniExitReason } from "@xceliqos/shared/src/entities/alumni-record.entity";
import { AlumniConfig } from "@xceliqos/shared/src/entities/alumni-config.entity";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(AlumniRecord)
    private readonly recordRepo: Repository<AlumniRecord>,
    @InjectRepository(AlumniConfig)
    private readonly configRepo: Repository<AlumniConfig>,
  ) {}

  // ── Config ──────────────────────────────────────────────────────────────

  async getConfig(school_id: string): Promise<AlumniConfig> {
    const config = await this.configRepo.findOne({ where: { school_id } });
    if (config) return config;
    const created = this.configRepo.create({ school_id } as unknown as AlumniConfig);
    return this.configRepo.save(created);
  }

  async updateConfig(school_id: string, dto: Partial<AlumniConfig>, updated_by: string): Promise<AlumniConfig> {
    const config = await this.getConfig(school_id);
    Object.assign(config, { ...dto, updated_by });
    return this.configRepo.save(config);
  }

  // ── Alumni Record Lifecycle ──────────────────────────────────────────────

  async initiateAlumni(school_id: string, dto: {
    student_id: string;
    graduation_year?: number;
    exit_reason?: AlumniExitReason;
    house_group_id?: string;
  }, created_by: string): Promise<AlumniRecord> {
    const existing = await this.recordRepo.findOne({ where: { school_id, student_id: dto.student_id } });
    if (existing) throw new BadRequestException("Alumni record already exists for this student");
    const record = this.recordRepo.create({
      ...dto,
      school_id,
      status: AlumniStatus.PENDING_OPT_IN,
      created_by,
    } as unknown as AlumniRecord);
    return this.recordRepo.save(record);
  }

  async recordParentConsent(school_id: string, id: string, consented: boolean, consent_by: string): Promise<AlumniRecord> {
    const record = await this.getRecord(school_id, id);
    if (record.status !== AlumniStatus.PENDING_OPT_IN) throw new BadRequestException("Record not in pending_opt_in state");
    record.parent_consented = consented;
    record.parent_consent_at = new Date();
    record.parent_consent_by = consent_by;
    record.status = consented ? AlumniStatus.DORMANT : AlumniStatus.OPTED_OUT;
    record.updated_by = consent_by;
    if (!consented) record.opted_out_at = new Date();
    return this.recordRepo.save(record);
  }

  async issueInviteCode(school_id: string, id: string, updated_by: string): Promise<{ invite_code: string; expires_at: Date }> {
    const record = await this.getRecord(school_id, id);
    const config = await this.getConfig(school_id);
    if (![AlumniStatus.PENDING_OPT_IN, AlumniStatus.DORMANT].includes(record.status)) {
      throw new BadRequestException("Invite code can only be issued for pending_opt_in or dormant records");
    }
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(raw, 10);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + (config.invite_code_expiry_days ?? 90));
    record.invite_code_hash = hash;
    record.invite_code_expires_at = expires_at;
    record.invite_issued_count = (record.invite_issued_count ?? 0) + 1;
    record.updated_by = updated_by;
    await this.recordRepo.save(record);
    // Raw code returned once — never stored
    return { invite_code: raw, expires_at };
  }

  async redeemInviteCode(school_id: string, id: string, invite_code: string): Promise<AlumniRecord> {
    const record = await this.getRecord(school_id, id);
    if (!record.invite_code_hash) throw new BadRequestException("No invite code issued for this record");
    if (record.invite_code_expires_at && record.invite_code_expires_at < new Date()) {
      throw new BadRequestException("Invite code has expired");
    }
    if (record.invite_code_used_at) throw new BadRequestException("Invite code already used");
    const valid = await bcrypt.compare(invite_code, record.invite_code_hash);
    if (!valid) throw new BadRequestException("Invalid invite code");
    record.status = AlumniStatus.ACTIVE;
    record.opted_in_at = new Date();
    record.invite_code_used_at = new Date();
    record.updated_by = id;
    return this.recordRepo.save(record);
  }

  async optOut(school_id: string, id: string, reason: string, updated_by: string): Promise<AlumniRecord> {
    const record = await this.getRecord(school_id, id);
    if (record.status === AlumniStatus.OPTED_OUT) throw new BadRequestException("Already opted out");
    record.status = AlumniStatus.OPTED_OUT;
    record.opted_out_at = new Date();
    record.opted_out_reason = reason;
    record.updated_by = updated_by;
    return this.recordRepo.save(record);
  }

  async suspend(school_id: string, id: string, reason: string, updated_by: string): Promise<AlumniRecord> {
    const record = await this.getRecord(school_id, id);
    record.status = AlumniStatus.SUSPENDED;
    record.suspension_reason = reason;
    record.updated_by = updated_by;
    return this.recordRepo.save(record);
  }

  async updateCareerPathway(school_id: string, id: string, dto: { career_pathway_consented: boolean; career_pathway?: Record<string, any> }, updated_by: string): Promise<AlumniRecord> {
    const record = await this.getRecord(school_id, id);
    if (record.status !== AlumniStatus.ACTIVE) throw new BadRequestException("Career pathway only available for active alumni");
    Object.assign(record, { ...dto, updated_by });
    return this.recordRepo.save(record);
  }

  async listRecords(school_id: string, status?: AlumniStatus): Promise<AlumniRecord[]> {
    const where: any = { school_id };
    if (status) where.status = status;
    return this.recordRepo.find({ where });
  }

  async getRecord(school_id: string, id: string): Promise<AlumniRecord> {
    const record = await this.recordRepo.findOne({ where: { id, school_id } });
    if (!record) throw new NotFoundException("Alumni record not found");
    return record;
  }

  async getRecordByStudent(school_id: string, student_id: string): Promise<AlumniRecord> {
    const record = await this.recordRepo.findOne({ where: { school_id, student_id } });
    if (!record) throw new NotFoundException("Alumni record not found for student");
    return record;
  }

  async updateLastActive(school_id: string, id: string): Promise<void> {
    await this.recordRepo.update({ id, school_id }, { last_active_at: new Date() });
  }
}
