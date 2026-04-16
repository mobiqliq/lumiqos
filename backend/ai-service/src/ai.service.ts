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
          {
            role: "system",
            content: "You are an expert NCERT pedagogical assistant. Respond ONLY in JSON format."
          },
          {
            role: "user",
            content: `Generate a lesson plan for: "${topic}". 
            Include: topic, objectives (array), content (detailed string), duration (minutes as number), and assessment.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty response from OpenAI");

      return JSON.parse(content) as ILessonPlan;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new InternalServerErrorException("AI service unavailable");
    }
  }
}
