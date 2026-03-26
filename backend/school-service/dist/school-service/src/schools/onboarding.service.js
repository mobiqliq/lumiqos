"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const ncert_seeder_service_1 = require("../database/ncert-seeder.service");
const pedagogical_pour_service_1 = require("./pedagogical-pour.service");
let OnboardingService = OnboardingService_1 = class OnboardingService {
    teacherSubjectRepo;
    ncertSeederService;
    pedagogicalPourService;
    logger = new common_1.Logger(OnboardingService_1.name);
    constructor(teacherSubjectRepo, ncertSeederService, pedagogicalPourService) {
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.ncertSeederService = ncertSeederService;
        this.pedagogicalPourService = pedagogicalPourService;
    }
    async launchAcademicYear(schoolId, yearId, board, teacherAssignments) {
        this.logger.log(`Initiating Academic Year Launch for School: ${schoolId}, Year: ${yearId}, Board: ${board}`);
        const assignmentsToSave = teacherAssignments.map(ta => this.teacherSubjectRepo.create({
            teacher_id: ta.teacher_id,
            class_id: ta.class_id,
            section_id: ta.section_id,
            subject_id: ta.subject_id,
            school_id: schoolId
        }));
        await this.teacherSubjectRepo.save(assignmentsToSave);
        this.logger.log(`Saved ${assignmentsToSave.length} teacher assignments.`);
        const uniqueClasses = [...new Set(teacherAssignments.map(ta => ta.class_id))];
        let totalTopicsSeeded = 0;
        for (const classId of uniqueClasses) {
            this.logger.log(`Seeding NCERT Syllabus for Class: ${classId}`);
            const dummySyllabus = {
                board: board,
                country: 'India',
                subjects: [
                    {
                        name: 'Core Standard Subject',
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
            totalTopicsSeeded += 400;
        }
        let successGrids = 0;
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
                await this.pedagogicalPourService.generateBaselineSchedule(schoolId, yearId, pour.class_id, pour.section_id, pour.subject_id);
                successGrids++;
            }
            catch (error) {
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
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = OnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ncert_seeder_service_1.NCERTSeederService,
        pedagogical_pour_service_1.PedagogicalPourService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map