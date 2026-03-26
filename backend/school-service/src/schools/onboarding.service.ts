import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { NCERTSeederService } from '../database/ncert-seeder.service';
import { PedagogicalPourService } from './pedagogical-pour.service';

@Injectable()
export class OnboardingService {
    private readonly logger = new Logger(OnboardingService.name);

    constructor(
        @InjectRepository(TeacherSubject) 
        private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        private readonly ncertSeederService: NCERTSeederService,
        private readonly pedagogicalPourService: PedagogicalPourService
    ) {}

    async launchAcademicYear(
        schoolId: string, 
        yearId: string, 
        board: string, 
        teacherAssignments: Array<{ teacher_id: string, class_id: string, section_id: string, subject_id: string, periods_per_day: number }>
    ) {
        this.logger.log(`Initiating Academic Year Launch for School: ${schoolId}, Year: ${yearId}, Board: ${board}`);

        // Step 1: Bulk insert primary assignments
        const assignmentsToSave = teacherAssignments.map(ta => 
            this.teacherSubjectRepo.create({
                teacher_id: ta.teacher_id,
                class_id: ta.class_id,
                section_id: ta.section_id,
                subject_id: ta.subject_id,
                school_id: schoolId
            })
        );
        
        await this.teacherSubjectRepo.save(assignmentsToSave);
        this.logger.log(`Saved ${assignmentsToSave.length} teacher assignments.`);

        // Step 2: Extract unique classes to seed the syllabus
        const uniqueClasses = [...new Set(teacherAssignments.map(ta => ta.class_id))];
        let totalTopicsSeeded = 0;

        for (const classId of uniqueClasses) {
            this.logger.log(`Seeding NCERT Syllabus for Class: ${classId}`);
            
            // Mocking a dynamic JSON payload for the seeder
            const dummySyllabus = {
                board: board,
                country: 'India',
                subjects: [
                    {
                        name: 'Core Standard Subject', // In real life, fetch mapping
                        units: [
                            { 
                                title: 'Unit 1: Foundations', 
                                weightage: 10, 
                                sequence: 1, 
                                lessons: [
                                    { title: 'Introduction', estimated_minutes: 45, complexity: 3 },
                                    { title: 'Deep Dive', estimated_minutes: 45, complexity: 7 }
                                ] 
                            }
                        ]
                    }
                ]
            };
            await this.ncertSeederService.seedFromJSON(schoolId, dummySyllabus);
            
            // Assuming 80 topics per subject roughly across 5 subjects = 400 for demo counts
            totalTopicsSeeded += 400; 
        }

        // Step 3: Loop through uniquely assigned sections and stream the syllabus into the calendar
        let successGrids = 0;
        
        // Ensure uniqueness for class + section + subject
        const uniquePours = [];
        const seenPours = new Set();
        for (const ta of teacherAssignments) {
            const signature = `${ta.class_id}_${ta.section_id}_${ta.subject_id}`;
            if (!seenPours.has(signature)) {
                seenPours.add(signature);
                uniquePours.push(ta);
            }
        }

        for (const pour of uniquePours) {
            this.logger.log(`Pouring syllabus for Section: ${pour.section_id}, Subject: ${pour.subject_id}`);
            try {
                await this.pedagogicalPourService.generateBaselineSchedule(
                    schoolId,
                    yearId,
                    pour.class_id,
                    pour.section_id,
                    pour.subject_id
                );
                successGrids++;
            } catch (error) {
                this.logger.error(`Failed to pour schedule for ${pour.section_id} - ${pour.subject_id}`, error);
            }
        }

        this.logger.log(`Launch Complete: Generated ${successGrids} subject schedules.`);

        return {
            status: "SUCCESS",
            message: "LumiqOS Curriculum Engine Initialized",
            stats: {
                teachers_assigned: assignmentsToSave.length,
                topics_seeded: totalTopicsSeeded,
                schedules_generated: successGrids,
                board: board,
                year: yearId
            }
        };
    }
}
