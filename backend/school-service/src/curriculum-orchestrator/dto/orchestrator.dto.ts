import { IsUUID, IsString, IsNotEmpty, IsOptional, IsDateString, IsArray } from 'class-validator';

export class GeneratePlanDto {
    @IsUUID()
    @IsNotEmpty()
    academic_year_id: string;

    @IsUUID()
    @IsNotEmpty()
    class_id: string;

    @IsUUID()
    @IsNotEmpty()
    subject_id: string;

    @IsDateString()
    @IsOptional()
    planned_start_date?: string;

    @IsDateString()
    @IsOptional()
    planned_end_date?: string;
}

export class LogTeachingDto {
    @IsUUID()
    @IsNotEmpty()
    class_id: string;

    @IsUUID()
    @IsNotEmpty()
    subject_id: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsArray()
    @IsNotEmpty()
    topics_covered: string[];

    @IsNotEmpty()
    actual_sessions: number;

    @IsString()
    @IsOptional()
    remarks?: string;
}
