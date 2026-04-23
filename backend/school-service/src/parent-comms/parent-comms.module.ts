import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentCommsController } from './parent-comms.controller';
import { ParentCommsService } from './parent-comms.service';
import { ParentMessageThread } from '@xceliqos/shared/src/entities/parent-message-thread.entity';
import { ParentMessage } from '@xceliqos/shared/src/entities/parent-message.entity';
import { BroadcastAnnouncement } from '@xceliqos/shared/src/entities/broadcast-announcement.entity';
import { BroadcastReadReceipt } from '@xceliqos/shared/src/entities/broadcast-read-receipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentMessageThread,
      ParentMessage,
      BroadcastAnnouncement,
      BroadcastReadReceipt,
    ]),
  ],
  controllers: [ParentCommsController],
  providers: [ParentCommsService],
  exports: [ParentCommsService],
})
export class ParentCommsModule {}
