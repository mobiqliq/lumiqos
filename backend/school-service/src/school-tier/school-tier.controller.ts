import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { SchoolTierService } from './school-tier.service';
import type { Request } from 'express';

@Controller('school-config/tier')
export class SchoolTierController {
    constructor(private readonly schoolTierService: SchoolTierService) {}

    @Get()
    getTierConfig(@Req() req: Request) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolTierService.getTierConfig(school_id);
    }

    @Post()
    upsertTierConfig(@Req() req: Request, @Body() dto: any) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolTierService.upsertTierConfig(school_id, dto);
    }

    @Get('priority-queue')
    getPriorityQueue(@Req() req: Request) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolTierService.getPriorityQueue(school_id);
    }

    @Get('bundles')
    getBundles(@Req() req: Request) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolTierService.getBundles(school_id);
    }

    @Post('bundles')
    upsertBundle(@Req() req: Request, @Body() dto: any) {
        const school_id = req.headers['x-school-id'] as string;
        return this.schoolTierService.upsertBundle(school_id, dto);
    }
}
