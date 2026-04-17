import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SchoolService {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
  ) {}

  async getAiLessonPlan(topic: string) {
    return firstValueFrom(
      this.aiClient.send({ cmd: 'create_lesson_plan' }, { topic })
    );
  }
}
