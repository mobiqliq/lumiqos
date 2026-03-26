import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class SubstitutionModule { }
