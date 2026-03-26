import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class GeneratePlanDto {
    @IsUUID()
    school_id: string;

    @IsUUID()
    academic_year_id: string;

    @IsUUID()
    class_id: string;

    @IsUUID()
    subject_id: string;

    @IsOptional()
    @IsBoolean()
    disruption_mode?: boolean;
}
