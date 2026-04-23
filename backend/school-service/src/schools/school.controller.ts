import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SchoolService } from './school.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { RbacGuard } from '@xceliqos/shared/index';
import { RequirePermissions } from '@xceliqos/shared/index';

@Controller('schools') // Bound to /schools inside the service (mapped to /schools in Gateway)
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) { }

    @Post() // Responds to API Gateway POST /schools
    async onboardSchool(@Body() onboardDto: any) {
        return this.schoolService.onboardSchool(onboardDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequirePermissions('system:manage') // Only higher level roles can query all schools
    async getSchools() {
        return this.schoolService.getSchools();
    }

    @MessagePattern({ cmd: 'get_schools' })
    async getSchoolsMicroservice() {
        return this.schoolService.getSchools();
    }

    // Period Configuration
    @MessagePattern({ cmd: 'get_period_config' })
    async getPeriodConfig(@Body() data: any) {
        return this.schoolService.getPeriodConfig(data.schoolId);
    }

    @MessagePattern({ cmd: 'save_period_config' })
    async savePeriodConfig(@Body() data: any) {
        return this.schoolService.savePeriodConfig(data.schoolId, data.config);
    }
}
