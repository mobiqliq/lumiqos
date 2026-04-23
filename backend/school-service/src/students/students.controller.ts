import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '@xceliqos/shared/index';
import { RbacGuard } from '@xceliqos/shared/index';
import { RequirePermissions } from '@xceliqos/shared/index';

@Controller('students')
@UseGuards(JwtAuthGuard, RbacGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    // --- Core Profile ---
    @Post()
    @RequirePermissions('student:write')
    createStudent(@Body() dto: any) {
        return this.studentsService.createStudent(dto);
    }

    @Get()
    @RequirePermissions('student:read')
    getStudents() {
        return this.studentsService.getStudents();
    }

    @MessagePattern({ cmd: 'get_students' })
    async getStudentsMicroservice() {
        return this.studentsService.getStudents();
    }

    @Get(':id')
    @RequirePermissions('student:read')
    getStudentById(@Param('id') id: string) {
        return this.studentsService.getStudentById(id);
    }

    @Put(':id')
    @RequirePermissions('student:write')
    updateStudent(@Param('id') id: string, @Body() dto: any) {
        return this.studentsService.updateStudent(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('student:write')
    deleteStudent(@Param('id') id: string) {
        return this.studentsService.deleteStudent(id);
    }

    // --- Enrollments ---
    @Post('enroll')
    @RequirePermissions('enrollment:write')
    enrollStudent(@Body() dto: any) {
        return this.studentsService.enrollStudent(dto);
    }

    @Put('enroll/promote')
    @RequirePermissions('enrollment:write')
    promoteStudent(@Body() dto: { student_id: string, current_enrollment_id: string, target_academic_year_id: string, target_class_id: string, target_section_id?: string, roll_number?: string }) {
        return this.studentsService.promoteStudent(dto.student_id, dto.current_enrollment_id, dto);
    }

    @Get(':id/enrollments')
    @RequirePermissions('enrollment:read')
    getEnrollments(@Param('id') studentId: string) {
        return this.studentsService.getEnrollmentsForStudent(studentId);
    }

    // --- Guardians ---
    @Post(':id/guardians')
    @RequirePermissions('student:write') // Guardians usually share student permission boundaries
    addGuardian(@Param('id') studentId: string, @Body() dto: any) {
        return this.studentsService.addGuardian(studentId, dto);
    }

    @Get(':id/guardians')
    @RequirePermissions('student:read')
    getGuardians(@Param('id') studentId: string) {
        return this.studentsService.getGuardians(studentId);
    }

    // --- Documents ---
    @Post(':id/documents')
    @RequirePermissions('student:write')
    uploadDocument(@Param('id') studentId: string, @Body() dto: any) {
        return this.studentsService.uploadDocument(studentId, dto);
    }

    // --- Gamification (Student Universe) ---
    @Get(':id/gamification')
    getGamificationProfile(@Param('id') studentId: string) {
        return this.studentsService.getGamificationProfile(studentId);
    }

    @Get(':id/quests')
    getQuests(@Param('id') studentId: string) {
        return this.studentsService.getQuests(studentId);
    }

    @Post(':id/quests/:questId/submit')
    submitQuest(@Param('id') studentId: string, @Param('questId') questId: string, @Body() dto: any) {
        return this.studentsService.submitQuest(studentId, questId, dto);
    }
}
