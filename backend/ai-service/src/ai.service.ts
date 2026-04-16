import { Injectable } from '@nestjs/common';
import { ILessonPlan } from '@lumiqos/shared';

@Injectable()
export class AiService {
  async createLessonPlan(topic: string): Promise<ILessonPlan> {
    return {
      topic,
      objectives: [
        `Understand core concepts of ${topic}`,
        `Analyze real-world applications of ${topic}`
      ],
      content: `AI-generated pedagogical content for ${topic} matching NCERT standards.`,
      duration: 40,
      assessment: `A 10-minute formative assessment on ${topic}.`
    };
  }
}
