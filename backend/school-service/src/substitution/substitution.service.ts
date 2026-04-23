import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class SubstitutionService {
    private readonly logger = new Logger(SubstitutionService.name);

    constructor(private aiService: AiService) { }

    async getAbsences() {
        // In a real system, this would fetch from a LeaveRequest or Attendance table for Teachers
        // For the demo, we return mock data representing a teacher who called in sick today.
        const store = TenantContext.getStore();
        const schoolId = store ? store.schoolId : 'demo-school';

        return [
            {
                id: 'abs_001',
                teacher_id: 'usr_t_004',
                teacher_name: 'Mr. Brown',
                reason: 'Sick Leave',
                status: 'pending_allocation', // pending_allocation, allocated
                impacted_periods: [
                    { period: 1, class: 'Class 10A', subject: 'Social Studies', time: '09:00 AM - 09:45 AM' },
                    { period: 2, class: 'Class 9B', subject: 'Social Studies', time: '09:45 AM - 10:30 AM' }
                ]
            }
        ];
    }

    async allocateSubstitutes(absenceId: string, absentTeacherId: string, periods: any[]) {
        const store = TenantContext.getStore();
        const schoolId = store ? store.schoolId : 'demo-school';

        // Trigger AI to find available teachers
        const allocationResult = await this.aiService.generateSubstituteAllocation(absentTeacherId, periods);

        return {
            absence_id: absenceId,
            ...allocationResult
        };
    }

    async notifySubstitutes(allocations: any[]) {
        this.logger.log('Sending automated push notifications to substitute teachers...');

        // Mock notification logic
        // In a real app, this would integrate with OneSignal, FCM, or an internal Notification service
        const notificationsSent = allocations.filter(a => a.substitute_id).length;

        return {
            status: 'Success',
            message: `Push notifications sent successfully to ${notificationsSent} allocated substitute(s).`
        };
    }
}
