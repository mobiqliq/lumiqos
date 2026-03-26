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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NCERTSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const curriculum_unit_entity_1 = require("../../../shared/src/entities/curriculum-unit.entity");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
let NCERTSeederService = class NCERTSeederService {
    boardRepo;
    subjectRepo;
    unitRepo;
    lessonRepo;
    schoolRepo;
    constructor(boardRepo, subjectRepo, unitRepo, lessonRepo, schoolRepo) {
        this.boardRepo = boardRepo;
        this.subjectRepo = subjectRepo;
        this.unitRepo = unitRepo;
        this.lessonRepo = lessonRepo;
        this.schoolRepo = schoolRepo;
    }
    async seedFromJSON(schoolId, jsonData) {
        let board = await this.boardRepo.findOne({ where: { name: jsonData.board } });
        if (!board) {
            board = await this.boardRepo.save(this.boardRepo.create({
                name: jsonData.board,
                country: jsonData.country || 'India'
            }));
        }
        for (const subData of jsonData.subjects) {
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
                const unit = await this.unitRepo.save(this.unitRepo.create({
                    school_id: schoolId,
                    subject_id: subject.id,
                    title: unitData.title,
                    weightage: unitData.weightage,
                    sequence_order: unitData.sequence
                }));
                for (const lessonData of unitData.lessons) {
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
        return { success: true, message: 'Seeding completed' };
    }
};
exports.NCERTSeederService = NCERTSeederService;
exports.NCERTSeederService = NCERTSeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(board_entity_1.Board)),
    __param(1, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(2, (0, typeorm_1.InjectRepository)(curriculum_unit_entity_1.CurriculumUnit)),
    __param(3, (0, typeorm_1.InjectRepository)(lesson_plan_entity_1.LessonPlan)),
    __param(4, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NCERTSeederService);
//# sourceMappingURL=ncert-seeder.service.js.map