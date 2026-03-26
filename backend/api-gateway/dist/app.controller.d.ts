import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
export declare class AppController {
    private readonly appService;
    private readonly schoolClient;
    constructor(appService: AppService, schoolClient: ClientProxy);
    getHello(): string;
    getDemoData(): Promise<{
        school: {
            name: any;
            code: any;
            region: any;
            affiliationBoard: any;
        };
        students: any;
        teachers: any;
        classes: {
            name: string;
            sections: string[];
            students: any;
            classTeacher: string;
            avgScore: number;
        }[];
        announcements: {
            id: number;
            title: string;
            body: string;
            time: string;
            priority: string;
        }[];
        fees: any;
        timetable: {
            period: number;
            time: string;
            subject: string;
            teacher: string;
            status: string;
        }[];
        insights: {
            principal: {
                type: string;
                icon: string;
                title: string;
                body: string;
                action: string;
            }[];
            teacher: {
                type: string;
                icon: string;
                title: string;
                body: string;
                action: string;
            }[];
            parent: {
                type: string;
                icon: string;
                title: string;
                body: string;
                action: string;
            }[];
            finance: {
                type: string;
                title: string;
                body: string;
                action: string;
            }[];
            hr: {
                type: string;
                title: string;
                body: string;
                action: string;
            }[];
            admin: {
                type: string;
                title: string;
                body: string;
                action: string;
            }[];
        };
        stats: {
            totalStudents: any;
            activeEnrolled: any;
            attendanceToday: any;
            overdueInvoices: any;
        };
        copilotConversations: {
            principal: {
                q: string;
                a: string;
            }[];
            teacher: {
                q: string;
                a: string;
            }[];
        };
        reportCards: {
            subject: string;
            midterm: number;
            final: number;
            grade: string;
            remarks: string;
        }[];
        admissionsPipeline: {
            stage: string;
            count: number;
            color: string;
        }[];
        expenses: {
            category: string;
            amount: string;
            pct: number;
        }[];
    }>;
    getPeriodConfig(): Promise<any>;
    savePeriodConfig(body: any): Promise<any>;
}
