import { IsUUID } from 'class-validator';

export class ApprovePlanDto {
    @IsUUID()
    plan_id: string;
}
