import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ChatChannel, ChatChannelType } from '@xceliqos/shared/src/entities/chat-channel.entity';
import { ChatMessage } from '@xceliqos/shared/src/entities/chat-message.entity';
import { ChatMember, ChatMemberRole, ChatMemberStatus } from '@xceliqos/shared/src/entities/chat-member.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class XceliQChatService {
  constructor(
    @InjectRepository(ChatChannel) private readonly channelRepo: Repository<ChatChannel>,
    @InjectRepository(ChatMessage) private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(ChatMember) private readonly memberRepo: Repository<ChatMember>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Channels ──────────────────────────────────────────────────────────────

  async listChannels(userId: string) {
    const schoolId = this.getSchoolId();
    // Return channels where user is a member
    const memberships = await this.memberRepo.find({
      where: { school_id: schoolId, user_id: userId },
    });
    const channelIds = memberships.map(m => m.channel_id);
    if (channelIds.length === 0) return [];
    return this.channelRepo
      .createQueryBuilder('c')
      .where('c.school_id = :schoolId', { schoolId })
      .andWhere('c.id IN (:...channelIds)', { channelIds })
      .andWhere('c.is_active = true')
      .andWhere('c.deleted_at IS NULL')
      .orderBy('c.name', 'ASC')
      .getMany();
  }

  async createChannel(dto: {
    name: string;
    type: ChatChannelType;
    description?: string;
    class_id?: string;
    subject_id?: string;
    department?: string;
    requires_acknowledgment?: boolean;
    member_user_ids?: string[];
  }, createdBy: string) {
    const schoolId = this.getSchoolId();
    const channel = this.channelRepo.create({
      school_id: schoolId,
      name: dto.name,
      type: dto.type,
      description: dto.description,
      class_id: dto.class_id,
      subject_id: dto.subject_id,
      department: dto.department,
      requires_acknowledgment: dto.requires_acknowledgment ?? false,
      created_by: createdBy,
      is_active: true,
    } as any) as unknown as ChatChannel;
    const saved = await this.channelRepo.save(channel);

    // Auto-add creator as admin member
    const memberIds = new Set<string>(dto.member_user_ids ?? []);
    memberIds.add(createdBy);

    const members = Array.from(memberIds).map(uid =>
      this.memberRepo.create({
        school_id: schoolId,
        channel_id: saved.id,
        user_id: uid,
        role: uid === createdBy ? ChatMemberRole.ADMIN : ChatMemberRole.MEMBER,
        status: ChatMemberStatus.ACTIVE,
        created_by: createdBy,
      }),
    );
    await this.memberRepo.save(members);
    return saved;
  }

  // ── Members ───────────────────────────────────────────────────────────────

  async listMembers(channelId: string) {
    const schoolId = this.getSchoolId();
    return this.memberRepo.find({
      where: { school_id: schoolId, channel_id: channelId },
    });
  }

  async addMember(channelId: string, userId: string, addedBy: string) {
    const schoolId = this.getSchoolId();
    const existing = await this.memberRepo.findOne({
      where: { school_id: schoolId, channel_id: channelId, user_id: userId },
    });
    if (existing) return existing;
    const member = this.memberRepo.create({
      school_id: schoolId,
      channel_id: channelId,
      user_id: userId,
      role: ChatMemberRole.MEMBER,
      status: ChatMemberStatus.ACTIVE,
      created_by: addedBy,
    });
    return this.memberRepo.save(member);
  }

  async updateMemberStatus(channelId: string, userId: string, status: ChatMemberStatus) {
    const schoolId = this.getSchoolId();
    await this.memberRepo.update(
      { school_id: schoolId, channel_id: channelId, user_id: userId },
      { status },
    );
    return { success: true };
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async getMessages(channelId: string, userId: string, limit = 50, before?: string) {
    const schoolId = this.getSchoolId();
    await this.assertMember(channelId, userId, schoolId);

    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.school_id = :schoolId', { schoolId })
      .andWhere('m.channel_id = :channelId', { channelId })
      .andWhere('m.deleted_at IS NULL')
      .orderBy('m.created_at', 'DESC')
      .take(limit);

    if (before) {
      qb.andWhere('m.created_at < (SELECT created_at FROM chat_message WHERE id = :before)', { before });
    }

    const messages = await qb.getMany();
    return messages.reverse();
  }

  async sendMessage(channelId: string, dto: {
    content: string;
    parent_message_id?: string;
    attachment_url?: string;
    attachment_name?: string;
    is_ai_response?: boolean;
    poll_id?: string;
  }, senderId: string) {
    const schoolId = this.getSchoolId();
    await this.assertMember(channelId, senderId, schoolId);

    // Block send if sender status is in_class (auto-suppress notifications design)
    // Message is still saved — status only affects notification delivery (future WS layer)
    const msg = this.messageRepo.create({
      school_id: schoolId,
      channel_id: channelId,
      sender_id: senderId,
      content: dto.content,
      parent_message_id: dto.parent_message_id,
      attachment_url: dto.attachment_url,
      attachment_name: dto.attachment_name,
      is_ai_response: dto.is_ai_response ?? false,
      poll_id: dto.poll_id,
      created_by: senderId,
    } as any);
    return this.messageRepo.save(msg);
  }

  // ── Acknowledgment ────────────────────────────────────────────────────────

  async acknowledgeChannel(channelId: string, userId: string) {
    const schoolId = this.getSchoolId();
    const channel = await this.channelRepo.findOne({
      where: { school_id: schoolId, id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    if (!channel.requires_acknowledgment) {
      return { success: true, note: 'Channel does not require acknowledgment' };
    }
    await this.memberRepo.update(
      { school_id: schoolId, channel_id: channelId, user_id: userId },
      { has_acknowledged: true, acknowledged_at: new Date() },
    );
    return { success: true };
  }

  async markRead(channelId: string, userId: string) {
    const schoolId = this.getSchoolId();
    await this.memberRepo.update(
      { school_id: schoolId, channel_id: channelId, user_id: userId },
      { last_read_at: new Date() },
    );
    return { success: true };
  }

  // ── Polls (stored in message metadata) ───────────────────────────────────

  async createPoll(channelId: string, dto: {
    question: string;
    options: string[];
  }, createdBy: string) {
    const schoolId = this.getSchoolId();
    await this.assertMember(channelId, createdBy, schoolId);

    const pollData = {
      question: dto.question,
      options: dto.options.map((o, i) => ({ id: i, text: o, votes: [] as string[] })),
    };

    const msg = this.messageRepo.create({
      school_id: schoolId,
      channel_id: channelId,
      sender_id: createdBy,
      content: `📊 Poll: ${dto.question}`,
      is_ai_response: false,
      created_by: createdBy,
      metadata: { poll: pollData },
    });
    return this.messageRepo.save(msg);
  }

  async castVote(messageId: string, optionId: number, userId: string) {
    const schoolId = this.getSchoolId();
    const msg = await this.messageRepo.findOne({
      where: { school_id: schoolId, id: messageId },
    });
    if (!msg) throw new NotFoundException('Poll message not found');
    const poll = msg.metadata?.poll;
    if (!poll) throw new NotFoundException('No poll in this message');

    // Remove previous vote from this user across all options
    poll.options.forEach((opt: any) => {
      opt.votes = opt.votes.filter((uid: string) => uid !== userId);
    });
    const option = poll.options.find((o: any) => o.id === optionId);
    if (!option) throw new NotFoundException('Option not found');
    option.votes.push(userId);

    msg.metadata = { ...msg.metadata, poll };
    return this.messageRepo.save(msg);
  }

  // ── Guard ─────────────────────────────────────────────────────────────────

  private async assertMember(channelId: string, userId: string, schoolId: string) {
    const member = await this.memberRepo.findOne({
      where: { school_id: schoolId, channel_id: channelId, user_id: userId },
    });
    if (!member) throw new ForbiddenException('Not a member of this channel');
  }
}
