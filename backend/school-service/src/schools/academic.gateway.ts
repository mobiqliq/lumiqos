import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // For development
    },
})
export class AcademicGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(AcademicGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // A teacher or service can broadcast when a lesson is marked complete
    broadcastLessonCompleted(schoolId: string, classId: string, subjectId: string, sectionId: string, newVelocity: number) {
        this.server.emit('lesson_completed', {
            school_id: schoolId,
            class_id: classId,
            subject_id: subjectId,
            section_id: sectionId,
            new_velocity: newVelocity,
            timestamp: new Date().toISOString()
        });
    }

    // A service can broadcast when the syllabus shifts
    broadcastCalendarUpdated(schoolId: string) {
        this.server.emit('calendar_updated', {
            school_id: schoolId,
            timestamp: new Date().toISOString()
        });
    }
}
