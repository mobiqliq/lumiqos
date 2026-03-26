"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const student_entity_1 = require("../../../shared/src/entities/student.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const student_enrollment_entity_1 = require("../../../shared/src/entities/student-enrollment.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const student_attendance_entity_1 = require("../../../shared/src/entities/student-attendance.entity");
const attendance_session_entity_1 = require("../../../shared/src/entities/attendance-session.entity");
const fee_invoice_entity_1 = require("../../../shared/src/entities/fee-invoice.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const curriculum_mapping_entity_1 = require("../../../shared/src/entities/curriculum-mapping.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
let SeederService = class SeederService {
    schoolRepo;
    studentRepo;
    yearRepo;
    classRepo;
    sectionRepo;
    enrollmentRepo;
    userRepo;
    attendanceRepo;
    sessionRepo;
    feeRepo;
    subjectRepo;
    syllabusRepo;
    mappingRepo;
    teacherSubjectRepo;
    boardConfigRepo;
    constructor(schoolRepo, studentRepo, yearRepo, classRepo, sectionRepo, enrollmentRepo, userRepo, attendanceRepo, sessionRepo, feeRepo, subjectRepo, syllabusRepo, mappingRepo, teacherSubjectRepo, boardConfigRepo) {
        this.schoolRepo = schoolRepo;
        this.studentRepo = studentRepo;
        this.yearRepo = yearRepo;
        this.classRepo = classRepo;
        this.sectionRepo = sectionRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.userRepo = userRepo;
        this.attendanceRepo = attendanceRepo;
        this.sessionRepo = sessionRepo;
        this.feeRepo = feeRepo;
        this.subjectRepo = subjectRepo;
        this.syllabusRepo = syllabusRepo;
        this.mappingRepo = mappingRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.boardConfigRepo = boardConfigRepo;
    }
    async onApplicationBootstrap() {
        const schoolCount = await this.schoolRepo.count();
        const userCount = await this.userRepo.count();
        let savedSchool;
        let class10;
        let savedYear;
        let savedSection;
        if (schoolCount === 0 || userCount === 0) {
            console.log('Seeding initial data for Principal & Teacher Dashboards...');
            const school = this.schoolRepo.create({
                name: 'Greenfield Academy',
                school_code: 'GFA-2026',
                region: 'ap-south-1',
                board: 'CBSE',
            });
            savedSchool = await this.schoolRepo.save(school);
            const year = this.yearRepo.create({
                school_id: savedSchool.id,
                name: '2025-26',
                start_date: new Date('2025-04-01'),
                end_date: new Date('2026-03-31'),
                status: 'active',
            });
            savedYear = await this.yearRepo.save(year);
            const classNames = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
            const savedClasses = [];
            for (const name of classNames) {
                const cls = this.classRepo.create({
                    school_id: savedSchool.id,
                    name: name,
                    class_name: name,
                    grade_level: parseInt(name.split(' ')[1]),
                });
                savedClasses.push(await this.classRepo.save(cls));
            }
            class10 = savedClasses.find(c => c.name === 'Class 10');
            if (!class10)
                throw new Error('Class 10 not found during seeding');
            const sectionA = this.sectionRepo.create({
                class_id: class10.id,
                school_id: savedSchool.id,
                name: 'A',
            });
            savedSection = await this.sectionRepo.save(sectionA);
            const teachersData = [
                { first_name: 'Rajesh', last_name: 'Kumar', email: 'principal@greenfield.edu', role: 'principal' },
                { first_name: 'Sunita', last_name: 'Verma', email: 'teacher@greenfield.edu', role: 'teacher' },
                { first_name: 'Mohammed', last_name: 'Ali', email: 'm.ali@greenfield.edu', role: 'teacher' },
            ];
            for (const t of teachersData) {
                const user = this.userRepo.create({
                    first_name: t.first_name,
                    last_name: t.last_name,
                    email: t.email,
                    school_id: savedSchool.id,
                    status: 'active',
                });
                await this.userRepo.save(user);
            }
            const session = this.sessionRepo.create({
                school_id: savedSchool.id,
                academic_year_id: savedYear.id,
                class_id: class10.id,
                section_id: savedSection.id,
                session_date: new Date(),
            });
            const savedSession = await this.sessionRepo.save(session);
            const studentsData = [
                { first_name: 'Aarav', last_name: 'Sharma', admission_number: 'GFA-2026-001', roll_number: '1', risk: 'low' },
                { first_name: 'Ishani', last_name: 'Verma', admission_number: 'GFA-2026-002', roll_number: '2', risk: 'low' },
                { first_name: 'Vivaan', last_name: 'Gupta', admission_number: 'GFA-2026-003', roll_number: '3', risk: 'medium' },
                { first_name: 'Ananya', last_name: 'Reddy', admission_number: 'GFA-2026-004', roll_number: '4', risk: 'low' },
                { first_name: 'Kabir', last_name: 'Singh', admission_number: 'GFA-2026-005', roll_number: '5', risk: 'high' },
                { first_name: 'Priya', last_name: 'Patel', admission_number: 'GFA-2026-006', roll_number: '6', risk: 'medium' },
            ];
            for (const s of studentsData) {
                const student = this.studentRepo.create({
                    first_name: s.first_name,
                    last_name: s.last_name,
                    admission_number: s.admission_number,
                    school_id: savedSchool.id,
                    status: 'active',
                    xp: Math.floor(Math.random() * 2000),
                    level: Math.floor(Math.random() * 15),
                    streak_days: Math.floor(Math.random() * 20),
                    skill_tree: { cognitive: 80, creative: 70, physical: 60, social: 75, life_skills: 65 }
                });
                const savedStudent = await this.studentRepo.save(student);
                await this.enrollmentRepo.save(this.enrollmentRepo.create({
                    student_id: savedStudent.id,
                    academic_year_id: savedYear.id,
                    class_id: class10.id,
                    section_id: savedSection.id,
                    school_id: savedSchool.id,
                    roll_number: s.roll_number,
                    admission_number: s.admission_number,
                    status: 'active',
                }));
                await this.attendanceRepo.save(this.attendanceRepo.create({
                    student_id: savedStudent.id,
                    school_id: savedSchool.id,
                    session_id: savedSession.id,
                    status: Math.random() > 0.1 ? 'present' : 'absent',
                }));
                await this.feeRepo.save(this.feeRepo.create({
                    student_id: savedStudent.id,
                    school_id: savedSchool.id,
                    academic_year_id: savedYear.id,
                    amount: 15000,
                    remaining_balance: s.risk === 'high' ? 15000 : 0,
                    due_date: new Date('2026-03-31'),
                    status: s.risk === 'high' ? 'overdue' : 'paid',
                }));
            }
        }
        else {
            const schoolWithUsers = await this.userRepo.createQueryBuilder('u')
                .select('u.school_id', 'id')
                .where('u.email = :email', { email: 'teacher@greenfield.edu' })
                .getRawOne();
            if (schoolWithUsers) {
                savedSchool = (await this.schoolRepo.findOne({ where: { id: schoolWithUsers.id } }));
            }
            else {
                savedSchool = (await this.schoolRepo.findOne({ where: { name: 'Greenfield Academy' } }));
            }
            class10 = (await this.classRepo.findOne({ where: { school_id: savedSchool?.id, name: 'Class 10' } }));
            console.log(`Using school: ${savedSchool?.name} (${savedSchool?.id})`);
        }
        if (!savedSchool || !class10) {
            console.error('Could not find Greenfield Academy or Class 10. Skipping curriculum seed.');
            return;
        }
        const mappingCount = await this.mappingRepo.count({ where: { school_id: savedSchool.id } });
        if (mappingCount === 0) {
            console.log('Seeding curriculum mapping data...');
            const subjectsData = [
                { name: 'Mathematics', code: 'MATH101' },
                { name: 'Science', code: 'SCI101' },
                { name: 'English', code: 'ENG101' }
            ];
            const teacher = await this.userRepo.findOne({ where: { school_id: savedSchool.id, email: 'teacher@greenfield.edu' } });
            for (const s of subjectsData) {
                const subject = await this.subjectRepo.save(this.subjectRepo.create({
                    school_id: savedSchool.id,
                    name: s.name,
                    subject_name: s.name,
                    subject_id: s.code
                }));
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateString = date.toISOString().split('T')[0];
                    if (teacher) {
                        await this.mappingRepo.save(this.mappingRepo.create({
                            school_id: savedSchool.id,
                            class_id: class10.id,
                            subject_id: subject.id,
                            teacher_id: teacher.id,
                            mapping_date: dateString,
                            topic: `Advanced ${s.name} - Module ${i + 1}`,
                            unit_number: i + 1,
                            status: 'scheduled'
                        }));
                    }
                }
            }
        }
        const teacher = await this.userRepo.findOne({ where: { school_id: savedSchool.id, email: 'teacher@greenfield.edu' } });
        if (teacher) {
            const gradeLevels = [1, 3, 5, 7, 8, 10, 12];
            const subjects = await this.subjectRepo.find({ where: { school_id: savedSchool.id } });
            for (const grade of gradeLevels) {
                let cls = await this.classRepo.findOne({ where: { school_id: savedSchool.id, grade_level: grade } });
                if (!cls) {
                    cls = await this.classRepo.save(this.classRepo.create({
                        school_id: savedSchool.id,
                        name: `Grade ${grade}`,
                        class_name: `Grade ${grade}`,
                        grade_level: grade
                    }));
                }
                for (const sub of subjects) {
                    const exists = await this.teacherSubjectRepo.findOne({
                        where: { teacher_id: teacher.id, class_id: cls.id, subject_id: sub.id }
                    });
                    if (!exists) {
                        await this.teacherSubjectRepo.save(this.teacherSubjectRepo.create({
                            school_id: savedSchool.id,
                            teacher_id: teacher.id,
                            class_id: cls.id,
                            subject_id: sub.id
                        }));
                    }
                    const sylExists = await this.syllabusRepo.findOne({
                        where: { school_id: savedSchool.id, class_id: cls.id, subject_id: sub.id }
                    });
                    if (!sylExists) {
                        await this.syllabusRepo.save(this.syllabusRepo.create({
                            school_id: savedSchool.id,
                            class_id: cls.id,
                            subject_id: sub.id,
                            units: 12,
                            estimated_days: 180,
                            current_topic: `Introduction to ${sub.name}`
                        }));
                    }
                }
            }
        }
        const boardCount = await this.boardConfigRepo.count();
        if (boardCount === 0) {
            console.log('Seeding board configurations...');
            await this.boardConfigRepo.save([
                this.boardConfigRepo.create({
                    name: 'CBSE',
                    exam_buffer_days: 7,
                    revision_days: 14,
                    max_sessions_per_day: 2
                }),
                this.boardConfigRepo.create({
                    name: 'ICSE',
                    exam_buffer_days: 5,
                    revision_days: 10,
                    max_sessions_per_day: 1
                })
            ]);
        }
        console.log('Seeding complete!');
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(3, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(4, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __param(5, (0, typeorm_1.InjectRepository)(student_enrollment_entity_1.StudentEnrollment)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(student_attendance_entity_1.StudentAttendance)),
    __param(8, (0, typeorm_1.InjectRepository)(attendance_session_entity_1.AttendanceSession)),
    __param(9, (0, typeorm_1.InjectRepository)(fee_invoice_entity_1.FeeInvoice)),
    __param(10, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(11, (0, typeorm_1.InjectRepository)(syllabus_entity_1.Syllabus)),
    __param(12, (0, typeorm_1.InjectRepository)(curriculum_mapping_entity_1.CurriculumMapping)),
    __param(13, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(14, (0, typeorm_1.InjectRepository)(board_entity_1.Board)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeederService);
//# sourceMappingURL=seeder.service.js.map