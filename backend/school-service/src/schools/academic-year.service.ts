import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { AcademicYearStatus } from '@xceliqos/shared/index';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class AcademicYearService {
    constructor(
        @InjectRepository(AcademicYear)
        private readonly academicYearRepository: Repository<AcademicYear>,
    ) { }

    async create(createDto: Partial<AcademicYear>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        if (createDto.status === AcademicYearStatus.ACTIVE) {
            const existingActive = await this.academicYearRepository.findOne({
                // The TenantRepository natively handles "school_id = context.school_id"
                where: { status: AcademicYearStatus.ACTIVE }
            });

            if (existingActive) {
                throw new BadRequestException('Active academic year already exists for this school.');
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

    async update(id: string, updateDto: Partial<AcademicYear>) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');

        if (updateDto.status === AcademicYearStatus.ACTIVE) {
            const existingActive = await this.academicYearRepository.findOne({
                where: { status: AcademicYearStatus.ACTIVE }
            });

            if (existingActive && existingActive.academic_year_id !== id) {
                throw new BadRequestException('Active academic year already exists for this school.');
            }
        }

        await this.academicYearRepository.update(id, updateDto);
        return this.academicYearRepository.findOne({ where: { academic_year_id: id } });
    }
}
