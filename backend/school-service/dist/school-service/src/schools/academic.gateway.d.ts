import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AcademicGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcastLessonCompleted(schoolId: string, classId: string, subjectId: string, sectionId: string, newVelocity: number): void;
    broadcastCalendarUpdated(schoolId: string): void;
}
