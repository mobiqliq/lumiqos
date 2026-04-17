import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ILessonPlan } from '@lumiqos/shared';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async createLessonPlan(topic: string): Promise<ILessonPlan> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert NCERT pedagogical assistant. Respond ONLY in JSON." },
          { role: "user", content: `Generate a lesson plan for: "${topic}". Include topic, objectives (array), content (string), duration (number), and assessment.` }
        ],
        response_format: { type: "json_object" }
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result || '{}') as ILessonPlan;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new InternalServerErrorException('AI Generation Failed');
    }
  }
}
