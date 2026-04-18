import { IsUUID, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class GeneratePlanDto {
  @IsUUID()
  @IsNotEmpty()
  school_id: string;

  @IsUUID()
  @IsNotEmpty()
  academic_year_id: string;

  @IsUUID()
  @IsNotEmpty()
  class_id: string;

  @IsUUID()
  @IsNotEmpty()
  subject_id: string;

  @IsBoolean()
  @IsOptional()
  disruption_mode?: boolean;
}

export class SyncCalendarDto {
  @IsUUID()
  @IsNotEmpty()
  school_id: string;

  @IsUUID()
  @IsNotEmpty()
  academic_year_id: string;
}
