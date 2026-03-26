import { CommunicationService } from './communication.service';
export declare class MessagesController {
    private readonly communicationService;
    constructor(communicationService: CommunicationService);
    createThread(dto: {
        student_id: string;
        teacher_id: string;
    }, user: any): Promise<import("@lumiqos/shared/index").MessageThread>;
    sendMessage(dto: {
        thread_id: string;
        message_text: string;
    }, user: any): Promise<import("@lumiqos/shared/index").Message>;
    getThreadMessages(threadId: string, user: any): Promise<import("@lumiqos/shared/index").Message[]>;
}
