import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantContext } from "@xceliqos/shared";
import { AdmissionApplication, AdmissionStage } from "@xceliqos/shared/src/entities/admission-application.entity";
import { AdmissionDocument, DocumentStatus } from "@xceliqos/shared/src/entities/admission-document.entity";
import { WaitlistEntry, WaitlistStatus } from "@xceliqos/shared/src/entities/waitlist-entry.entity";
import { ReservationConfig } from "@xceliqos/shared/src/entities/reservation-config.entity";

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(AdmissionApplication) private readonly appRepo: Repository<AdmissionApplication>,
    @InjectRepository(AdmissionDocument) private readonly docRepo: Repository<AdmissionDocument>,
    @InjectRepository(WaitlistEntry) private readonly waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(ReservationConfig) private readonly reservationRepo: Repository<ReservationConfig>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new BadRequestException("Tenant context missing");
    return store.schoolId;
  }

  private generateApplicationNumber(schoolId: string): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `APP-${year}-${random}`;
  }

  // --- Applications ---

  async createApplication(dto: any) {
    const schoolId = this.getSchoolId();
    const application_number = this.generateApplicationNumber(schoolId);
    const app = this.appRepo.create({
      ...dto,
      school_id: schoolId,
      application_number,
      stage: AdmissionStage.INQUIRY,
      stage_history: [{ stage: AdmissionStage.INQUIRY, changed_at: new Date(), notes: "Application created" }],
    } as any);
    return this.appRepo.save(app);
  }

  async getApplications(filters: { stage?: string; academic_year_id?: string; class_id?: string }) {
    const schoolId = this.getSchoolId();
    const qb = this.appRepo.createQueryBuilder("a")
      .where("a.school_id = :schoolId", { schoolId })
      .orderBy("a.created_at", "DESC");
    if (filters.stage) qb.andWhere("a.stage = :stage", { stage: filters.stage });
    if (filters.academic_year_id) qb.andWhere("a.academic_year_id = :ayId", { ayId: filters.academic_year_id });
    if (filters.class_id) qb.andWhere("a.applying_for_class_id = :classId", { classId: filters.class_id });
    return qb.getMany();
  }

  async getApplication(id: string) {
    const schoolId = this.getSchoolId();
    const app = await this.appRepo.findOne({ where: { id, school_id: schoolId } });
    if (!app) throw new NotFoundException("Application not found");
    const documents = await this.docRepo.find({ where: { application_id: id, school_id: schoolId } });
    return { ...app, documents };
  }

  async advanceStage(id: string, dto: { stage: AdmissionStage; notes?: string }) {
    const schoolId = this.getSchoolId();
    const app = await this.appRepo.findOne({ where: { id, school_id: schoolId } });
    if (!app) throw new NotFoundException("Application not found");

    const stageOrder = Object.values(AdmissionStage);
    const currentIdx = stageOrder.indexOf(app.stage);
    const newIdx = stageOrder.indexOf(dto.stage);

    // Allow direct rejection/withdrawal from any stage
    const terminalStages = [AdmissionStage.WITHDRAWN, AdmissionStage.REJECTED, AdmissionStage.ENROLLED];
    if (!terminalStages.includes(dto.stage) && newIdx < currentIdx) {
      throw new BadRequestException("Cannot move application backwards in pipeline");
    }

    app.stage_history = [...(app.stage_history || []), {
      stage: dto.stage, changed_at: new Date(), notes: dto.notes || "",
    }];
    app.stage = dto.stage;

    // Auto-promote waitlist when offer is declined
    if (dto.stage === AdmissionStage.WITHDRAWN || dto.stage === AdmissionStage.REJECTED) {
      await this.promoteNextWaitlistCandidate(app.academic_year_id, app.applying_for_class_id, schoolId);
    }

    return this.appRepo.save(app);
  }

  async recordOffer(id: string, dto: { offer_expiry_date: string; admission_fee_amount?: number; admission_fee_currency?: string }) {
    const schoolId = this.getSchoolId();
    const app = await this.appRepo.findOne({ where: { id, school_id: schoolId } });
    if (!app) throw new NotFoundException("Application not found");
    app.offer_date = new Date().toISOString().split("T")[0];
    app.offer_expiry_date = dto.offer_expiry_date;
    app.admission_fee_amount = (dto.admission_fee_amount || null) as any;
    app.admission_fee_currency = (dto.admission_fee_currency || null) as any;
    app.stage = AdmissionStage.OFFER;
    app.stage_history = [...(app.stage_history || []), { stage: AdmissionStage.OFFER, changed_at: new Date() }];
    return this.appRepo.save(app);
  }

  async respondToOffer(id: string, dto: { accepted: boolean; notes?: string }) {
    const schoolId = this.getSchoolId();
    const app = await this.appRepo.findOne({ where: { id, school_id: schoolId } });
    if (!app) throw new NotFoundException("Application not found");
    if (app.stage !== AdmissionStage.OFFER) throw new BadRequestException("Application is not at offer stage");

    app.offer_accepted = dto.accepted;
    app.offer_responded_at = new Date();

    if (dto.accepted) {
      app.stage = AdmissionStage.PAYMENT;
      app.stage_history = [...(app.stage_history || []), { stage: AdmissionStage.PAYMENT, changed_at: new Date() }];
    } else {
      app.stage = AdmissionStage.REJECTED;
      app.notes = dto.notes || "Offer declined";
      app.stage_history = [...(app.stage_history || []), { stage: AdmissionStage.REJECTED, changed_at: new Date(), notes: "Offer declined" }];
      await this.promoteNextWaitlistCandidate(app.academic_year_id, app.applying_for_class_id, schoolId);
    }
    return this.appRepo.save(app);
  }

  // --- Documents ---

  async addDocument(applicationId: string, dto: any) {
    const schoolId = this.getSchoolId();
    const app = await this.appRepo.findOne({ where: { id: applicationId, school_id: schoolId } });
    if (!app) throw new NotFoundException("Application not found");
    const doc = this.docRepo.create({ ...dto, application_id: applicationId, school_id: schoolId } as any);
    return this.docRepo.save(doc);
  }

  async verifyDocument(docId: string, dto: { status: DocumentStatus; rejection_reason?: string }) {
    const schoolId = this.getSchoolId();
    const doc = await this.docRepo.findOne({ where: { id: docId, school_id: schoolId } });
    if (!doc) throw new NotFoundException("Document not found");
    doc.status = dto.status;
    if (dto.status === DocumentStatus.REJECTED) doc.rejection_reason = (dto.rejection_reason || null) as any;
    if (dto.status === DocumentStatus.VERIFIED) doc.verified_at = new Date();
    return this.docRepo.save(doc);
  }

  // --- Waitlist ---

  async addToWaitlist(dto: any) {
    const schoolId = this.getSchoolId();
    const existing = await this.waitlistRepo.findOne({
      where: { application_id: dto.application_id, school_id: schoolId },
    });
    if (existing) throw new ConflictException("Application already on waitlist");

    const count = await this.waitlistRepo.count({
      where: { school_id: schoolId, academic_year_id: dto.academic_year_id, class_id: dto.class_id, status: WaitlistStatus.ACTIVE },
    });

    const entry = this.waitlistRepo.create({
      ...dto,
      school_id: schoolId,
      status: WaitlistStatus.ACTIVE,
      position: count + 1,
    } as any);
    return this.waitlistRepo.save(entry);
  }

  async getWaitlist(academicYearId: string, classId?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.waitlistRepo.createQueryBuilder("w")
      .where("w.school_id = :schoolId", { schoolId })
      .andWhere("w.academic_year_id = :ayId", { ayId: academicYearId })
      .andWhere("w.status = :status", { status: WaitlistStatus.ACTIVE })
      .orderBy("w.position", "ASC");
    if (classId) qb.andWhere("w.class_id = :classId", { classId });
    return qb.getMany();
  }

  private async promoteNextWaitlistCandidate(academicYearId: string, classId: string, schoolId: string) {
    const next = await this.waitlistRepo.findOne({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, status: WaitlistStatus.ACTIVE, auto_promote: true },
      order: { position: "ASC" } as any,
    });
    if (!next) return;
    next.status = WaitlistStatus.OFFERED;
    next.offer_sent_at = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    next.offer_expires_at = expiry;
    await this.waitlistRepo.save(next);
  }

  async respondToWaitlistOffer(id: string, dto: { accepted: boolean }) {
    const schoolId = this.getSchoolId();
    const entry = await this.waitlistRepo.findOne({ where: { id, school_id: schoolId } });
    if (!entry) throw new NotFoundException("Waitlist entry not found");
    entry.status = dto.accepted ? WaitlistStatus.ACCEPTED : WaitlistStatus.DECLINED;
    entry.responded_at = new Date();
    await this.waitlistRepo.save(entry);
    if (!dto.accepted) {
      await this.promoteNextWaitlistCandidate(entry.academic_year_id, entry.class_id, schoolId);
    }
    return entry;
  }

  // --- Reservation Config ---

  async upsertReservationConfig(dto: any) {
    const schoolId = this.getSchoolId();
    let config = await this.reservationRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id || null,
        quota_category: dto.quota_category,
      },
    });
    if (config) {
      Object.assign(config, dto);
      return this.reservationRepo.save(config);
    }
    const created = this.reservationRepo.create({ ...dto, school_id: schoolId } as any);
    return this.reservationRepo.save(created);
  }

  async getReservationConfigs(academicYearId: string) {
    const schoolId = this.getSchoolId();
    return this.reservationRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, is_active: true },
    });
  }

  async getPipelineSummary(academicYearId: string) {
    const schoolId = this.getSchoolId();
    const stages = Object.values(AdmissionStage);
    const counts = await Promise.all(
      stages.map(stage =>
        this.appRepo.count({ where: { school_id: schoolId, academic_year_id: academicYearId, stage } })
          .then(count => ({ stage, count }))
      )
    );
    const waitlistCount = await this.waitlistRepo.count({
      where: { school_id: schoolId, academic_year_id: academicYearId, status: WaitlistStatus.ACTIVE },
    });
    return { pipeline: counts, waitlist_active: waitlistCount };
  }
}
