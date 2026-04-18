import { IsUUID } from 'class-validator';

export class PlanStatusQueryDto {
    @IsUUID()
    school_id: string;

    @IsUUID()
    academic_year_id: string;

    @IsUUID()
    class_id: string;

    @IsUUID()
    subject_id: string;
}
