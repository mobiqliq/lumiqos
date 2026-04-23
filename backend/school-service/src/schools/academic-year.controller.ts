import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { RbacGuard } from '@xceliqos/shared/index';
import { RequirePermissions } from '@xceliqos/shared/index';

@Controller('academic-years')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AcademicYearController {
    constructor(private readonly academicYearService: AcademicYearService) { }

    @Post()
    @RequirePermissions('academic:write')
    create(@Body() createDto: any) {
        return this.academicYearService.create(createDto);
    }

    @Get()
    @RequirePermissions('academic:read')
    findAll() {
        return this.academicYearService.findAll();
    }

    @Put(':id')
    @RequirePermissions('academic:write')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.academicYearService.update(id, updateDto);
    }
}
