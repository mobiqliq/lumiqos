import { AiService } from '../ai/ai.service';
export declare class SubstitutionService {
    private aiService;
    private readonly logger;
    constructor(aiService: AiService);
    getAbsences(): Promise<{
        id: string;
        teacher_id: string;
        teacher_name: string;
        reason: string;
        status: string;
        impacted_periods: {
            period: number;
            class: string;
            subject: string;
            time: string;
        }[];
    }[]>;
    allocateSubstitutes(absenceId: string, absentTeacherId: string, periods: any[]): Promise<{
        status: string;
        allocated: {
            period: any;
            class: any;
            subject: any;
            original_teacher: string;
            allocated_substitute: string;
            substitute_id: string | null;
            match_confidence: string;
        }[];
        absence_id: string;
    }>;
    notifySubstitutes(allocations: any[]): Promise<{
        status: string;
        message: string;
    }>;
}
