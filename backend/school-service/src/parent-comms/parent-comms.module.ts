import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentCommsController } from './parent-comms.controller';
import { ParentCommsService } from './parent-comms.service';
import { ParentMessageThread } from '@xceliqos/shared/src/entities/parent-message-thread.entity';
import { ParentMessage } from '@xceliqos/shared/src/entities/parent-message.entity';
import { BroadcastAnnouncement } from '@xceliqos/shared/src/entities/broadcast-announcement.entity';
import { BroadcastReadReceipt } from '@xceliqos/shared/src/entities/broadcast-read-receipt.entity';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentMessageThread,
      ParentMessage,
      BroadcastAnnouncement,
      BroadcastReadReceipt,
      StudentGuardian,
      Student,
      User,
    ]),
  ],
  controllers: [ParentCommsController],
  providers: [ParentCommsService],
  exports: [ParentCommsService],
})
export class ParentCommsModule {}
