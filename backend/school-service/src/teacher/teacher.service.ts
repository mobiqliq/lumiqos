import { Injectable, Logger } from '@nestjs/common';
import { ILessonPlan } from '@lumiqos/shared';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  async getLessonPlan(topic: string): Promise<ILessonPlan> {
    try {
      const response = await fetch('http://localhost:3000/ai/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson plan from AI service');
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error generating lesson plan: ${error.message}`);
      throw error;
    }
  }
  
  // Existing methods would follow...
}
