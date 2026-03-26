import { Repository } from 'typeorm';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
export declare class AcademicYearService {
    private readonly academicYearRepository;
    constructor(academicYearRepository: Repository<AcademicYear>);
    create(createDto: Partial<AcademicYear>): Promise<AcademicYear>;
    findAll(): Promise<AcademicYear[]>;
    update(id: string, updateDto: Partial<AcademicYear>): Promise<AcademicYear | null>;
}
