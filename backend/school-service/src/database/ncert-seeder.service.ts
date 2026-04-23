import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '@xceliqos/shared/src/entities/board.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { CurriculumUnit } from '@xceliqos/shared/src/entities/curriculum-unit.entity';
import { LessonPlan } from '@xceliqos/shared/src/entities/lesson-plan.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';

@Injectable()
export class NCERTSeederService {
    constructor(
        @InjectRepository(Board)
        private boardRepo: Repository<Board>,
        @InjectRepository(Subject)
        private subjectRepo: Repository<Subject>,
        @InjectRepository(CurriculumUnit)
        private unitRepo: Repository<CurriculumUnit>,
        @InjectRepository(LessonPlan)
        private lessonRepo: Repository<LessonPlan>,
        @InjectRepository(School)
        private schoolRepo: Repository<School>,
    ) {}

    async seedFromJSON(schoolId: string, jsonData: any) {
        // 1. Get/Create Board
        let board = await this.boardRepo.findOne({ where: { name: jsonData.board } });
        if (!board) {
            board = await this.boardRepo.save(this.boardRepo.create({
                name: jsonData.board,
                country: jsonData.country || 'India'
            }));
        }

        for (const subData of jsonData.subjects) {
            // 2. Create Subject
            let subject = await this.subjectRepo.findOne({ 
                where: { school_id: schoolId, name: subData.name, board_id: board.id } 
            });
            if (!subject) {
                subject = await this.subjectRepo.save(this.subjectRepo.create({
                    school_id: schoolId,
                    name: subData.name,
                    board_id: board.id
                }));
            }

            for (const unitData of subData.units) {
                // 3. Find or Create Curriculum Unit
                let unit = await this.unitRepo.findOne({
                    where: { school_id: schoolId, subject_id: subject.id, title: unitData.title }
                });

                if (!unit) {
                    unit = await this.unitRepo.save(this.unitRepo.create({
                        school_id: schoolId,
                        subject_id: subject.id,
                        title: unitData.title,
                        weightage: unitData.weightage,
                        sequence_order: unitData.sequence
                    }));
                }

                for (const lessonData of unitData.lessons) {
                    // 4. Find or Create Lesson Plan
                    const existingLesson = await this.lessonRepo.findOne({
                        where: { school_id: schoolId, unit_id: unit.id, title: lessonData.title }
                    });

                    if (!existingLesson) {
                        await this.lessonRepo.save(this.lessonRepo.create({
                            school_id: schoolId,
                            subject_id: subject.id,
                            unit_id: unit.id,
                            title: lessonData.title,
                            learning_outcome: lessonData.learning_outcome,
                            estimated_minutes: lessonData.estimated_minutes,
                            complexity_index: lessonData.complexity,
                            tags: lessonData.tags || [],
                            plan_data: {} 
                        }));
                    }
                }
            }
        }
        return { success: true, message: 'Seeding completed' };
    }
}
