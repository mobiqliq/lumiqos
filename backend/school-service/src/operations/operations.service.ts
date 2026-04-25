import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LibraryRecord } from "@xceliqos/shared/src/entities/library-record.entity";
import { TransportRoute } from "@xceliqos/shared/src/entities/transport-route.entity";
import { TransportAssignment } from "@xceliqos/shared/src/entities/transport-assignment.entity";
import { VisitorLog } from "@xceliqos/shared/src/entities/visitor-log.entity";
import { OperationsConfig } from "@xceliqos/shared/src/entities/operations-config.entity";

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(LibraryRecord) private libraryRepo: Repository<LibraryRecord>,
    @InjectRepository(TransportRoute) private routeRepo: Repository<TransportRoute>,
    @InjectRepository(TransportAssignment) private assignmentRepo: Repository<TransportAssignment>,
    @InjectRepository(VisitorLog) private visitorRepo: Repository<VisitorLog>,
    @InjectRepository(OperationsConfig) private configRepo: Repository<OperationsConfig>,
  ) {}

  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig(schoolId: string): Promise<OperationsConfig> {
    const existing = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (existing) return existing;
    const created = this.configRepo.create({ school_id: schoolId } as any) as unknown as OperationsConfig;
    return this.configRepo.save(created) as unknown as OperationsConfig;
  }

  async upsertConfig(schoolId: string, dto: any): Promise<OperationsConfig> {
    const existing = await this.configRepo.findOne({ where: { school_id: schoolId } });
    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing) as unknown as OperationsConfig;
    }
    const created = this.configRepo.create({ school_id: schoolId, ...dto } as any) as unknown as OperationsConfig;
    return this.configRepo.save(created) as unknown as OperationsConfig;
  }

  // ── Library ───────────────────────────────────────────────────────────────

  async addBook(schoolId: string, dto: any): Promise<LibraryRecord> {
    const record = this.libraryRepo.create({ school_id: schoolId, ...dto } as any);
    return this.libraryRepo.save(record) as any;
  }

  async searchBooks(schoolId: string, query: any): Promise<LibraryRecord[]> {
    const qb = this.libraryRepo.createQueryBuilder("lr")
      .where("lr.school_id = :schoolId", { schoolId })
      .andWhere("lr.deleted_at IS NULL");
    if (query.title) qb.andWhere("lr.title ILIKE :title", { title: `%${query.title}%` });
    if (query.isbn) qb.andWhere("lr.isbn = :isbn", { isbn: query.isbn });
    if (query.status) qb.andWhere("lr.status = :status", { status: query.status });
    if (query.subject_id) qb.andWhere("lr.subject_id = :subjectId", { subjectId: query.subject_id });
    return qb.orderBy("lr.title", "ASC").getMany() as any;
  }

  async getBook(schoolId: string, id: string): Promise<LibraryRecord> {
    const record = await this.libraryRepo.findOne({ where: { id, school_id: schoolId } });
    if (!record) throw new NotFoundException("Library record not found");
    return record;
  }

  async issueBook(schoolId: string, id: string, dto: any): Promise<LibraryRecord> {
    const record = await this.getBook(schoolId, id);
    if (record.available_copies < 1) throw new NotFoundException("No copies available");
    const config = await this.getConfig(schoolId);
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + config.max_loan_days);
    Object.assign(record, {
      status: "issued",
      issued_to_student_id: dto.student_id || null,
      issued_to_staff_id: dto.staff_id || null,
      issued_at: new Date(),
      due_at: dueAt,
      returned_at: null,
      available_copies: record.available_copies - 1,
    });
    return this.libraryRepo.save(record) as any;
  }

  async returnBook(schoolId: string, id: string, dto: any): Promise<LibraryRecord> {
    const record = await this.getBook(schoolId, id);
    const now = new Date();
    let fineAmount = 0;
    if (record.due_at && now > record.due_at) {
      const config = await this.getConfig(schoolId);
      const overdueDays = Math.ceil((now.getTime() - record.due_at.getTime()) / 86400000);
      fineAmount = overdueDays * Number(config.fine_per_day);
    }
    Object.assign(record, {
      status: "available",
      returned_at: now,
      available_copies: record.available_copies + 1,
      reading_completed: dto.reading_completed ?? false,
      reading_rating: dto.reading_rating ?? null,
      fine_amount: fineAmount,
      fine_paid: fineAmount === 0,
    });
    return this.libraryRepo.save(record) as any;
  }

  async renewBook(schoolId: string, id: string): Promise<LibraryRecord> {
    const record = await this.getBook(schoolId, id);
    const config = await this.getConfig(schoolId);
    if (record.renewal_count >= config.max_renewals) {
      throw new NotFoundException("Maximum renewals reached");
    }
    const dueAt = new Date(record.due_at || new Date());
    dueAt.setDate(dueAt.getDate() + config.max_loan_days);
    Object.assign(record, { due_at: dueAt, renewal_count: record.renewal_count + 1 });
    return this.libraryRepo.save(record) as any;
  }

  async payFine(schoolId: string, id: string): Promise<LibraryRecord> {
    const record = await this.getBook(schoolId, id);
    record.fine_paid = true;
    return this.libraryRepo.save(record) as any;
  }

  // ── Transport Routes ──────────────────────────────────────────────────────

  async createRoute(schoolId: string, dto: any): Promise<TransportRoute> {
    const route = this.routeRepo.create({ school_id: schoolId, ...dto } as any);
    return this.routeRepo.save(route) as any;
  }

  async getRoutes(schoolId: string, academicYearId?: string): Promise<TransportRoute[]> {
    const where: any = { school_id: schoolId };
    if (academicYearId) where.academic_year_id = academicYearId;
    return this.routeRepo.find({ where }) as any;
  }

  async getRoute(schoolId: string, id: string): Promise<TransportRoute> {
    const route = await this.routeRepo.findOne({ where: { id, school_id: schoolId } });
    if (!route) throw new NotFoundException("Transport route not found");
    return route;
  }

  async updateRoute(schoolId: string, id: string, dto: any): Promise<TransportRoute> {
    const route = await this.getRoute(schoolId, id);
    Object.assign(route, dto);
    return this.routeRepo.save(route) as any;
  }

  // ── Transport Assignments ─────────────────────────────────────────────────

  async assignStudent(schoolId: string, dto: any): Promise<TransportAssignment> {
    const existing = await this.assignmentRepo.findOne({
      where: { school_id: schoolId, student_id: dto.student_id, academic_year_id: dto.academic_year_id },
    });
    if (existing) {
      Object.assign(existing, dto);
      return this.assignmentRepo.save(existing) as any;
    }
    const assignment = this.assignmentRepo.create({ school_id: schoolId, ...dto } as any);
    return this.assignmentRepo.save(assignment) as any;
  }

  async getAssignments(schoolId: string, routeId?: string, academicYearId?: string): Promise<TransportAssignment[]> {
    const where: any = { school_id: schoolId };
    if (routeId) where.route_id = routeId;
    if (academicYearId) where.academic_year_id = academicYearId;
    return this.assignmentRepo.find({ where }) as any;
  }

  async getStudentAssignment(schoolId: string, studentId: string, academicYearId: string): Promise<TransportAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { school_id: schoolId, student_id: studentId, academic_year_id: academicYearId },
    });
    if (!assignment) throw new NotFoundException("Transport assignment not found");
    return assignment;
  }

  // ── Visitor Log ───────────────────────────────────────────────────────────

  async checkIn(schoolId: string, dto: any): Promise<VisitorLog> {
    const log = this.visitorRepo.create({
      school_id: schoolId,
      check_in_at: new Date(),
      ...dto,
    } as any);
    return this.visitorRepo.save(log) as any;
  }

  async checkOut(schoolId: string, id: string): Promise<VisitorLog> {
    const log = await this.visitorRepo.findOne({ where: { id, school_id: schoolId } });
    if (!log) throw new NotFoundException("Visitor log not found");
    log.check_out_at = new Date();
    return this.visitorRepo.save(log) as any;
  }

  async getVisitorLogs(schoolId: string, query: any): Promise<VisitorLog[]> {
    const qb = this.visitorRepo.createQueryBuilder("vl")
      .where("vl.school_id = :schoolId", { schoolId })
      .andWhere("vl.deleted_at IS NULL");
    if (query.date) {
      const start = new Date(query.date); start.setHours(0, 0, 0, 0);
      const end = new Date(query.date); end.setHours(23, 59, 59, 999);
      qb.andWhere("vl.check_in_at BETWEEN :start AND :end", { start, end });
    }
    if (query.purpose) qb.andWhere("vl.purpose = :purpose", { purpose: query.purpose });
    if (query.flagged) qb.andWhere("vl.flagged = :flagged", { flagged: query.flagged === "true" });
    return qb.orderBy("vl.check_in_at", "DESC").getMany();
  }

  async flagVisitor(schoolId: string, id: string, reason: string): Promise<VisitorLog> {
    const log = await this.visitorRepo.findOne({ where: { id, school_id: schoolId } });
    if (!log) throw new NotFoundException("Visitor log not found");
    log.flagged = true;
    log.flag_reason = reason;
    return this.visitorRepo.save(log) as any;
  }

  async getActiveVisitors(schoolId: string): Promise<VisitorLog[]> {
    return this.visitorRepo.createQueryBuilder("vl")
      .where("vl.school_id = :schoolId", { schoolId })
      .andWhere("vl.check_out_at IS NULL")
      .andWhere("vl.deleted_at IS NULL")
      .orderBy("vl.check_in_at", "DESC")
      .getMany() as any;
  }
}
