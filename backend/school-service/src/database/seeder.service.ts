import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(School) private readonly schoolRepo: Repository<School>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
        @InjectRepository(AttendanceSession) private readonly sessionRepo: Repository<AttendanceSession>,
        @InjectRepository(FeeInvoice) private readonly feeRepo: Repository<FeeInvoice>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(Syllabus) private readonly syllabusRepo: Repository<Syllabus>,
        @InjectRepository(CurriculumMapping) private readonly mappingRepo: Repository<CurriculumMapping>,
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(Board) private readonly boardConfigRepo: Repository<Board>,
    ) { }

    async onApplicationBootstrap() {
        console.log('--- STARTING IDEMPOTENT SEEDER ---');
        
        // 1. Find or Create School
        let school = await this.schoolRepo.findOne({ where: { school_code: 'GFA-2026' } });
        if (!school) {
            school = await this.schoolRepo.save(this.schoolRepo.create({
                name: 'Greenfield Academy',
                school_code: 'GFA-2026',
                region: 'ap-south-1',
                board: 'CBSE',
            }));
            console.log('Seeded School: Greenfield Academy');
        }

        // 2. Find or Create Academic Year
        let year = await this.yearRepo.findOne({ where: { school_id: school.id, name: '2025-26' } });
        if (!year) {
            year = await this.yearRepo.save(this.yearRepo.create({
                school_id: school.id,
                name: '2025-26',
                start_date: new Date('2025-04-01'),
                end_date: new Date('2026-03-31'),
                status: 'active',
            }));
        }

        // 3. Find or Create Classes
        const classNames = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
        for (const name of classNames) {
            const exists = await this.classRepo.findOne({ where: { school_id: school.id, name: name } });
            if (!exists) {
                await this.classRepo.save(this.classRepo.create({
                    school_id: school.id,
                    name: name,
                    class_name: name,
                    grade_level: parseInt(name.split(' ')[1]),
                }));
            }
        }

        // 4. Find or Create Teachers
        const teachersData = [
            { first_name: 'Rajesh', last_name: 'Kumar', email: 'principal@greenfield.edu' },
            { first_name: 'Sunita', last_name: 'Verma', email: 'teacher@greenfield.edu' },
        ];
        for (const t of teachersData) {
            const exists = await this.userRepo.findOne({ where: { email: t.email } });
            if (!exists) {
                await this.userRepo.save(this.userRepo.create({
                    ...t,
                    school_id: school.id,
                    status: 'active',
                }));
            }
        }

        // 5. Seed Boards
        const boards = ['CBSE', 'ICSE'];
        for (const bName of boards) {
            const exists = await this.boardConfigRepo.findOne({ where: { name: bName } });
            if (!exists) {
                await this.boardConfigRepo.save(this.boardConfigRepo.create({
                    name: bName,
                    exam_buffer_days: bName === 'CBSE' ? 7 : 5,
                    revision_days: bName === 'CBSE' ? 14 : 10,
                    max_sessions_per_day: bName === 'CBSE' ? 2 : 1
                }));
            }
        }

        console.log('--- IDEMPOTENT SEEDING COMPLETE ---');
    }
}
