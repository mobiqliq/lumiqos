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
exports.AcademicYearService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
let AcademicYearService = class AcademicYearService {
    academicYearRepository;
    constructor(academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }
    async create(createDto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        if (createDto.status === index_1.AcademicYearStatus.ACTIVE) {
            const existingActive = await this.academicYearRepository.findOne({
                where: { status: index_1.AcademicYearStatus.ACTIVE }
            });
            if (existingActive) {
                throw new common_1.BadRequestException('Active academic year already exists for this school.');
            }
        }
        const year = this.academicYearRepository.create({
            ...createDto,
            school_id: store.schoolId,
        });
        return this.academicYearRepository.save(year);
    }
    async findAll() {
        return this.academicYearRepository.find();
    }
    async update(id, updateDto) {
        const store = index_2.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        if (updateDto.status === index_1.AcademicYearStatus.ACTIVE) {
            const existingActive = await this.academicYearRepository.findOne({
                where: { status: index_1.AcademicYearStatus.ACTIVE }
            });
            if (existingActive && existingActive.academic_year_id !== id) {
                throw new common_1.BadRequestException('Active academic year already exists for this school.');
            }
        }
        await this.academicYearRepository.update(id, updateDto);
        return this.academicYearRepository.findOne({ where: { academic_year_id: id } });
    }
};
exports.AcademicYearService = AcademicYearService;
exports.AcademicYearService = AcademicYearService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AcademicYearService);
//# sourceMappingURL=academic-year.service.js.map