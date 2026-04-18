import { IsUUID } from 'class-validator';

export class HealthSummaryQueryDto {
    @IsUUID()
    school_id: string;

    @IsUUID()
    academic_year_id: string;
}
