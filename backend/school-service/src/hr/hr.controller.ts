import { Controller, Get, Req } from '@nestjs/common';
import { HrService } from './hr.service';
import { TenantContext } from '@lumiqos/shared/index';
import type { Request } from 'express';

@Controller('hr')
export class HrController {
    constructor(private readonly hrService: HrService) {}

    @Get('overview')
    getHrOverview(@Req() req: Request) {
        const schoolId = (req.headers['x-school-id'] as string) || TenantContext.getStore()?.schoolId;
        return this.hrService.getHrOverview(schoolId);
    }
}
