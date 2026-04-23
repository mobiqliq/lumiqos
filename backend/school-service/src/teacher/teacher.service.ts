import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonPlan, TenantContext } from '@xceliqos/shared';

@Injectable()
export class TeacherService {
  private readonly logger = new Logger(TeacherService.name);

  constructor(
    @InjectRepository(LessonPlan)
    private readonly lessonPlanRepo: Repository<LessonPlan>,
  ) {}

  async getLessonPlan(topic: string): Promise<any> {
    const _store = TenantContext.getStore(); const schoolId = _store?.schoolId ?? ''; const userId = _store?.userId ?? '';

    try {
      const response = await fetch('http://localhost:3000/ai/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error('AI Service Unreachable');
      const aiPlan = await response.json();

      const newPlan = this.lessonPlanRepo.create({
        school_id: schoolId,
        teacher_id: userId,
        title: topic,
        plan_data: aiPlan,
        class_id: 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8', 
        subject_id: 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8',
      });

      return await this.lessonPlanRepo.save(newPlan);
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async findAllPlans(): Promise<any[]> {
    const _store = TenantContext.getStore(); const schoolId = _store?.schoolId ?? ''; const userId = _store?.userId ?? '';
    return this.lessonPlanRepo.find({
      where: { 
        school_id: schoolId,
        teacher_id: userId 
      },
      order: { created_at: 'DESC' }
    });
  }
}
