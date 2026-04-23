import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XceliQChatController } from './xceliq-chat.controller';
import { XceliQChatService } from './xceliq-chat.service';
import { ChatChannel } from '@xceliqos/shared/src/entities/chat-channel.entity';
import { ChatMessage } from '@xceliqos/shared/src/entities/chat-message.entity';
import { ChatMember } from '@xceliqos/shared/src/entities/chat-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatChannel, ChatMessage, ChatMember]),
  ],
  controllers: [XceliQChatController],
  providers: [XceliQChatService],
  exports: [XceliQChatService],
})
export class XceliQChatModule {}
