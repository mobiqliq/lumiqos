import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentMessageThread, ParentMessageThreadStatus, ParentMessageThreadRecipientType } from '@xceliqos/shared/src/entities/parent-message-thread.entity';
import { ParentMessage, ParentMessageSenderType } from '@xceliqos/shared/src/entities/parent-message.entity';
import { BroadcastAnnouncement, BroadcastAudienceType, BroadcastTriggerType } from '@xceliqos/shared/src/entities/broadcast-announcement.entity';
import { BroadcastReadReceipt } from '@xceliqos/shared/src/entities/broadcast-read-receipt.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class ParentCommsService {
  constructor(
    @InjectRepository(ParentMessageThread) private readonly threadRepo: Repository<ParentMessageThread>,
    @InjectRepository(ParentMessage) private readonly messageRepo: Repository<ParentMessage>,
    @InjectRepository(BroadcastAnnouncement) private readonly broadcastRepo: Repository<BroadcastAnnouncement>,
    @InjectRepository(BroadcastReadReceipt) private readonly receiptRepo: Repository<BroadcastReadReceipt>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Threads ───────────────────────────────────────────────────────────────

  async createThread(dto: {
    student_id: string;
    recipient_type: ParentMessageThreadRecipientType;
    assigned_to_user_id?: string;
    subject: string;
    initial_message: string;
    sla_hours?: number;
  }, parentUserId: string) {
    const schoolId = this.getSchoolId();

    const slaHours = dto.sla_hours ?? 24;
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const thread = this.threadRepo.create({
      school_id: schoolId,
      parent_user_id: parentUserId,
      student_id: dto.student_id,
      recipient_type: dto.recipient_type,
      assigned_to_user_id: dto.assigned_to_user_id,
      subject: dto.subject,
      status: ParentMessageThreadStatus.OPEN,
      sla_hours: slaHours,
      sla_due_at: slaDueAt,
      created_by: parentUserId,
    } as any) as unknown as ParentMessageThread;

    const savedThread = await this.threadRepo.save(thread);

    // Auto-create initial message
    const msg = this.messageRepo.create({
      school_id: schoolId,
      thread_id: savedThread.id,
      sender_id: parentUserId,
      sender_type: ParentMessageSenderType.PARENT,
      content: dto.initial_message,
      created_by: parentUserId,
    } as any) as unknown as ParentMessage;

    await this.messageRepo.save(msg);
    return savedThread;
  }

  async listThreads(userId: string, role: string) {
    const schoolId = this.getSchoolId();
    const isParent = role === 'parent';

    const qb = this.threadRepo
      .createQueryBuilder('t')
      .where('t.school_id = :schoolId', { schoolId })
      .andWhere('t.deleted_at IS NULL')
      .orderBy('t.updated_at', 'DESC');

    if (isParent) {
      qb.andWhere('t.parent_user_id = :userId', { userId });
    } else {
      // Staff: see threads assigned to them or all (for principal/admin)
      qb.andWhere(
        '(t.assigned_to_user_id = :userId OR t.recipient_type = :frontDesk)',
        { userId, frontDesk: ParentMessageThreadRecipientType.FRONT_DESK }
      );
    }

    return qb.getMany();
  }

  async getThread(threadId: string, userId: string) {
    const schoolId = this.getSchoolId();
    const thread = await this.threadRepo.findOne({
      where: { school_id: schoolId, id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const messages = await this.messageRepo.find({
      where: { school_id: schoolId, thread_id: threadId },
      order: { created_at: 'ASC' },
    });

    return { thread, messages };
  }

  async sendMessage(threadId: string, dto: {
    content: string;
    attachment_url?: string;
    attachment_name?: string;
  }, senderId: string, senderType: ParentMessageSenderType) {
    const schoolId = this.getSchoolId();

    const thread = await this.threadRepo.findOne({
      where: { school_id: schoolId, id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.status === ParentMessageThreadStatus.RESOLVED) {
      throw new ForbiddenException('Thread is resolved. Reopen before sending.');
    }

    const msg = this.messageRepo.create({
      school_id: schoolId,
      thread_id: threadId,
      sender_id: senderId,
      sender_type: senderType,
      content: dto.content,
      attachment_url: dto.attachment_url,
      attachment_name: dto.attachment_name,
      created_by: senderId,
    } as any) as unknown as ParentMessage;

    const saved = await this.messageRepo.save(msg);

    // Set first_response_at if staff replies for first time
    if (senderType === ParentMessageSenderType.STAFF && !thread.first_response_at) {
      await this.threadRepo.update(
        { id: threadId, school_id: schoolId },
        { first_response_at: new Date() }
      );
    }

    // Touch thread updated_at for ordering
    await this.threadRepo.update({ id: threadId, school_id: schoolId }, { updated_by: senderId });

    return saved;
  }

  async updateThreadStatus(threadId: string, status: ParentMessageThreadStatus, userId: string, escalateTo?: string) {
    const schoolId = this.getSchoolId();
    const update: Partial<ParentMessageThread> = { status, updated_by: userId };

    if (status === ParentMessageThreadStatus.RESOLVED) {
      update.resolved_at = new Date();
    }
    if (status === ParentMessageThreadStatus.ESCALATED && escalateTo) {
      update.escalated_to_user_id = escalateTo;
      update.escalated_at = new Date();
    }

    await this.threadRepo.update({ id: threadId, school_id: schoolId }, update);
    return { success: true, status };
  }

  // ── Broadcasts ────────────────────────────────────────────────────────────

  async createBroadcast(dto: {
    title: string;
    body: string;
    audience_type: BroadcastAudienceType;
    trigger_type?: BroadcastTriggerType;
    target_class_id?: string;
    target_section_id?: string;
    recipient_count?: number;
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    const broadcast = this.broadcastRepo.create({
      school_id: schoolId,
      title: dto.title,
      body: dto.body,
      audience_type: dto.audience_type,
      trigger_type: dto.trigger_type ?? BroadcastTriggerType.MANUAL,
      target_class_id: dto.target_class_id,
      target_section_id: dto.target_section_id,
      recipient_count: dto.recipient_count ?? 0,
      read_count: 0,
      created_by: createdBy,
    } as any) as unknown as BroadcastAnnouncement;

    return this.broadcastRepo.save(broadcast);
  }

  async listBroadcasts() {
    const schoolId = this.getSchoolId();
    return this.broadcastRepo.find({
      where: { school_id: schoolId },
      order: { created_at: 'DESC' },
    });
  }

  async markBroadcastRead(announcementId: string, userId: string) {
    const schoolId = this.getSchoolId();

    const existing = await this.receiptRepo.findOne({
      where: { school_id: schoolId, announcement_id: announcementId, user_id: userId },
    });
    if (existing) return { success: true, note: 'Already read' };

    const receipt = this.receiptRepo.create({
      school_id: schoolId,
      announcement_id: announcementId,
      user_id: userId,
      read_at: new Date(),
      created_by: userId,
    } as any) as unknown as BroadcastReadReceipt;

    await this.receiptRepo.save(receipt);

    // Increment read_count
    await this.broadcastRepo
      .createQueryBuilder()
      .update(BroadcastAnnouncement)
      .set({ read_count: () => 'read_count + 1' })
      .where('id = :id AND school_id = :schoolId', { id: announcementId, schoolId })
      .execute();

    return { success: true };
  }

  async getBroadcastReceipts(announcementId: string) {
    const schoolId = this.getSchoolId();
    return this.receiptRepo.find({
      where: { school_id: schoolId, announcement_id: announcementId },
      order: { read_at: 'ASC' },
    });
  }
}
