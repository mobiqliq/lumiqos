import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XceliQAssistantController } from './xceliq-assistant.controller';
import { XceliQAssistantService } from './xceliq-assistant.service';
import { AssistantInteraction } from '@xceliqos/shared/src/entities/assistant-interaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssistantInteraction]),
  ],
  controllers: [XceliQAssistantController],
  providers: [XceliQAssistantService],
  exports: [XceliQAssistantService],
})
export class XceliQAssistantModule {}
