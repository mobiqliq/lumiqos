import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';

@Controller('substitution')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SubstitutionController {
    constructor(private readonly substitutionService: SubstitutionService) { }

    @Get('absences')
    @RequirePermissions('admin:read')
    getAbsences() {
        return this.substitutionService.getAbsences();
    }

    @Post('allocate')
    @RequirePermissions('admin:write')
    allocateSubstitutes(@Body() body: { absenceId: string, absentTeacherId: string, periods: any[] }) {
        return this.substitutionService.allocateSubstitutes(body.absenceId, body.absentTeacherId, body.periods);
    }

    @Post('notify')
    @RequirePermissions('admin:write')
    notifySubstitutes(@Body() body: { allocations: any[] }) {
        return this.substitutionService.notifySubstitutes(body.allocations);
    }
}
