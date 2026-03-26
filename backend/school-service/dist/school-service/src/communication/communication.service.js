"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../../shared/src/entities/notification.entity");
const notification_recipient_entity_1 = require("../../../shared/src/entities/notification-recipient.entity");
const message_thread_entity_1 = require("../../../shared/src/entities/message-thread.entity");
const message_entity_1 = require("../../../shared/src/entities/message.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const student_guardian_entity_1 = require("../../../shared/src/entities/student-guardian.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
let CommunicationService = class CommunicationService {
    notificationRepo;
    recipientRepo;
    threadRepo;
    messageRepo;
    enrollmentRepo;
    guardianRepo;
    teacherSubjectRepo;
    userRepo;
    constructor(notificationRepo, recipientRepo, threadRepo, messageRepo, enrollmentRepo, guardianRepo, teacherSubjectRepo, userRepo) {
        this.notificationRepo = notificationRepo;
        this.recipientRepo = recipientRepo;
        this.threadRepo = threadRepo;
        this.messageRepo = messageRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.guardianRepo = guardianRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.userRepo = userRepo;
    }
    async createNotification(dto, creatorId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        let targetLevel = 'school';
        if (dto.target_class_id && !dto.target_section_id) {
            targetLevel = 'class';
        }
        else if (dto.target_section_id && !dto.target_class_id) {
            targetLevel = 'section';
        }
        else if (dto.target_class_id && dto.target_section_id) {
            targetLevel = 'section';
        }
        let enrollments = [];
        if (targetLevel === 'school') {
            enrollments = await this.enrollmentRepo.find({ where: { school_id: schoolId, status: index_2.EnrollmentStatus.ACTIVE } });
        }
        else if (targetLevel === 'class') {
            enrollments = await this.enrollmentRepo.find({ where: { school_id: schoolId, class_id: dto.target_class_id, status: index_2.EnrollmentStatus.ACTIVE } });
        }
        else if (targetLevel === 'section') {
            enrollments = await this.enrollmentRepo.find({
                where: {
                    school_id: schoolId,
                    section_id: dto.target_section_id,
                    ...(dto.target_class_id ? { class_id: dto.target_class_id } : {}),
                    status: index_2.EnrollmentStatus.ACTIVE
                }
            });
        }
        if (targetLevel !== 'school' && enrollments.length === 0) {
        }
        const studentIds = enrollments.map(e => e.student_id);
        let parentIds = new Set();
        if (studentIds.length > 0) {
            const guardians = await this.guardianRepo.find({
                where: { school_id: schoolId, student_id: (0, typeorm_2.In)(studentIds) }
            });
            guardians.forEach(g => parentIds.add(g.user_id));
        }
        const notification = this.notificationRepo.create({
            school_id: schoolId,
            title: dto.title,
            message: dto.message,
            type: dto.type || 'general',
            created_by: creatorId
        });
        const savedNotification = await this.notificationRepo.save(notification);
        if (parentIds.size > 0) {
            const recipients = Array.from(parentIds).map(userId => {
                return this.recipientRepo.create({
                    school_id: schoolId,
                    notification_id: savedNotification.notification_id,
                    user_id: userId,
                    delivery_status: 'sent',
                    read_status: 'unread'
                });
            });
            await this.recipientRepo.save(recipients);
        }
        else if (targetLevel === 'school') {
            const allUsers = await this.userRepo.find({ where: { school_id: schoolId } });
            const recipients = allUsers.map(u => {
                return this.recipientRepo.create({
                    school_id: schoolId,
                    notification_id: savedNotification.notification_id,
                    user_id: u.user_id,
                    delivery_status: 'sent',
                    read_status: 'unread'
                });
            });
            await this.recipientRepo.save(recipients);
        }
        return savedNotification;
    }
    async getNotifications(userId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        return this.recipientRepo.find({
            where: { school_id: schoolId, user_id: userId },
            relations: ['notification'],
            order: { sent_at: 'DESC' }
        });
    }
    async markNotificationRead(notificationId, userId) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.recipientRepo.update({ school_id: schoolId, notification_id: notificationId, user_id: userId }, { read_status: 'read' });
        return { success: true };
    }
    async createThread(studentId, teacherId, currentUser) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const isTeacherInitiating = currentUser.userId === teacherId;
        const dbUser = await this.userRepo.findOne({ where: { user_id: currentUser.userId }, relations: ['role'] });
        const roleName = dbUser?.role?.role_name;
        if (roleName === 'student') {
            throw new common_1.ForbiddenException('Students cannot access teacher-parent messages.');
        }
        if (roleName === 'parent') {
            const guardianLink = await this.guardianRepo.findOne({
                where: { school_id: schoolId, user_id: currentUser.userId, student_id: studentId }
            });
            if (!guardianLink) {
                throw new common_1.ForbiddenException('Parent not authorized for this student.');
            }
        }
        if (roleName === 'teacher' || roleName === 'staff') {
            const isGlobalAdmin = ['principal', 'school_admin'].includes(roleName);
            if (!isGlobalAdmin) {
                const enrollments = await this.enrollmentRepo.find({
                    where: { school_id: schoolId, student_id: studentId, status: index_2.EnrollmentStatus.ACTIVE }
                });
                if (enrollments.length === 0) {
                    throw new common_1.ForbiddenException("Teacher not authorized to message this student's guardian (no active enrollment)");
                }
                const enrollment = enrollments[0];
                const teacherMaps = await this.teacherSubjectRepo.find({
                    where: { school_id: schoolId, teacher_id: currentUser.userId, class_id: enrollment.class_id }
                });
                const matchesSection = teacherMaps.some(map => !map.section_id || map.section_id === enrollment.section_id);
                if (teacherMaps.length === 0 || !matchesSection) {
                    throw new common_1.ForbiddenException("Teacher not authorized to message this student's guardian");
                }
            }
        }
        const existingThread = await this.threadRepo.findOne({
            where: { school_id: schoolId, student_id: studentId, teacher_id: teacherId }
        });
        if (existingThread) {
            return existingThread;
        }
        const thread = this.threadRepo.create({
            school_id: schoolId,
            student_id: studentId,
            teacher_id: teacherId,
            created_by: currentUser.userId
        });
        return this.threadRepo.save(thread);
    }
    async validateThreadAccess(threadId, currentUser) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const thread = await this.threadRepo.findOne({ where: { thread_id: threadId, school_id: schoolId } });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        const dbUser = await this.userRepo.findOne({ where: { user_id: currentUser.userId }, relations: ['role'] });
        const roleName = dbUser?.role?.role_name;
        if (roleName === 'parent') {
            const guardianLink = await this.guardianRepo.findOne({
                where: { school_id: schoolId, user_id: currentUser.userId, student_id: thread.student_id }
            });
            if (!guardianLink)
                throw new common_1.ForbiddenException('Parent not authorized to view this thread.');
        }
        else if (roleName === 'student') {
            throw new common_1.ForbiddenException('Students cannot access teacher-parent messages.');
        }
        if (['teacher', 'staff'].includes(roleName || '')) {
            if (thread.teacher_id !== currentUser.userId && !['principal', 'school_admin'].includes(roleName || '')) {
                throw new common_1.ForbiddenException('Teacher not authorized to participate in this thread.');
            }
        }
        return thread;
    }
    async sendMessage(threadId, messageText, currentUser) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.validateThreadAccess(threadId, currentUser);
        const msg = this.messageRepo.create({
            school_id: schoolId,
            thread_id: threadId,
            sender_id: currentUser.userId,
            message_text: messageText
        });
        return this.messageRepo.save(msg);
    }
    async getThreadMessages(threadId, currentUser) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        await this.validateThreadAccess(threadId, currentUser);
        return this.messageRepo.find({
            where: { school_id: schoolId, thread_id: threadId },
            relations: ['sender'],
            order: { sent_at: 'ASC' }
        });
    }
    async dispatchEventNotification(type, payload) {
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_recipient_entity_1.NotificationRecipient)),
    __param(2, (0, typeorm_1.InjectRepository)(message_thread_entity_1.MessageThread)),
    __param(3, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(5, (0, typeorm_1.InjectRepository)(student_guardian_entity_1.StudentGuardian)),
    __param(6, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(7, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map