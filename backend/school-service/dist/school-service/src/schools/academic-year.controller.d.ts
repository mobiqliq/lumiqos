import { AcademicYearService } from './academic-year.service';
export declare class AcademicYearController {
    private readonly academicYearService;
    constructor(academicYearService: AcademicYearService);
    create(createDto: any): Promise<import("@lumiqos/shared/index").AcademicYear>;
    findAll(): Promise<import("@lumiqos/shared/index").AcademicYear[]>;
    update(id: string, updateDto: any): Promise<import("@lumiqos/shared/index").AcademicYear | null>;
}
