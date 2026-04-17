import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { LessonPlan } from '@lumiqos/shared';

@Injectable()
export class SchoolService {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
    @InjectRepository(LessonPlan)
    private readonly lessonPlanRepo: Repository<LessonPlan>,
  ) {}

  async getAiLessonPlan(topic: string) {
    // 1. Get generation from AI Service
    const generated = await firstValueFrom(
      this.aiClient.send({ cmd: 'create_lesson_plan' }, { topic })
    );

    // 2. Persist to Database
    const newPlan = this.lessonPlanRepo.create({
      topic: generated.topic || topic,
      content: JSON.stringify(generated), // Storing the full JSON payload
      metadata: { source: 'openai-gpt-4o-mini' }
    });

    await this.lessonPlanRepo.save(newPlan);

    return generated;
  }
}
