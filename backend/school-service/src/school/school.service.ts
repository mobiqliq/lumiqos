import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonPlan } from '@xceliqos/shared/src/entities';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(LessonPlan)
    private lessonPlanRepository: Repository<LessonPlan>,
  ) {}

  async getAiLessonPlan(topic: string) {
    // Basic placeholder for AI generation logic
    return {
      topic,
      content: `This lesson will cover the fundamentals of ${topic}.`,
      generated_at: new Date().toISOString(),
    };
  }

  async saveLessonPlan(data: any) {
    const lessonPlan = this.lessonPlanRepository.create(data);
    return this.lessonPlanRepository.save(lessonPlan);
  }
}
