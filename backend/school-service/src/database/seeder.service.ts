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
        const schoolCount = await this.schoolRepo.count();
        const userCount = await this.userRepo.count();
        
        let savedSchool: School;
        let class10: Class;
        let savedYear: AcademicYear;
        let savedSection: Section;

        if (schoolCount === 0 || userCount === 0) {
            console.log('Seeding initial data for Principal & Teacher Dashboards...');
            
            // 1. Create School
            const school = this.schoolRepo.create({
                name: 'Greenfield Academy',
                school_code: 'GFA-2026',
                region: 'ap-south-1',
                board: 'CBSE', // Set default board for seeding
            });
            savedSchool = await this.schoolRepo.save(school);

            // 2. Create Academic Year
            const year = this.yearRepo.create({
                school_id: savedSchool.id,
                name: '2025-26',
                start_date: new Date('2025-04-01'),
                end_date: new Date('2026-03-31'),
                status: 'active',
            });
            savedYear = await this.yearRepo.save(year);

            // 3. Create Classes
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

            class10 = savedClasses.find(c => c.name === 'Class 10') as Class;
            if (!class10) throw new Error('Class 10 not found during seeding');

            // 4. Create Section
            const sectionA = this.sectionRepo.create({
                class_id: class10.id,
                school_id: savedSchool.id,
                name: 'A',
            });
            savedSection = await this.sectionRepo.save(sectionA);

            // 5. Create Teachers (Users)
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

            // 6. Create Attendance Session for Today
            const session = this.sessionRepo.create({
                school_id: savedSchool.id,
                academic_year_id: savedYear.id,
                class_id: class10.id,
                section_id: savedSection.id,
                session_date: new Date(),
            });
            const savedSession = await this.sessionRepo.save(session);

            // 7. Create Students
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

                // Create enrollment
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

                // Create Attendance
                await this.attendanceRepo.save(this.attendanceRepo.create({
                    student_id: savedStudent.id,
                    school_id: savedSchool.id,
                    session_id: savedSession.id,
                    status: Math.random() > 0.1 ? 'present' : 'absent',
                }));

                // Create some Fees
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
        } else {
            // Find a school that actually has users (from previous seeds)
            const schoolWithUsers = await this.userRepo.createQueryBuilder('u')
                .select('u.school_id', 'id')
                .where('u.email = :email', { email: 'teacher@greenfield.edu' })
                .getRawOne();
            
            if (schoolWithUsers) {
                savedSchool = (await this.schoolRepo.findOne({ where: { id: schoolWithUsers.id } })) as School;
            } else {
                savedSchool = (await this.schoolRepo.findOne({ where: { name: 'Greenfield Academy' } })) as School;
            }
            
            class10 = (await this.classRepo.findOne({ where: { school_id: savedSchool?.id, name: 'Class 10' } })) as Class;
            console.log(`Using school: ${savedSchool?.name} (${savedSchool?.id})`);
        }

        if (!savedSchool || !class10) {
            console.error('Could not find Greenfield Academy or Class 10. Skipping curriculum seed.');
            return;
        }

        const mappingCount = await this.mappingRepo.count({ where: { school_id: savedSchool.id } });
        if (mappingCount === 0) {
            console.log('Seeding curriculum mapping data...');
            // 8. Create Subjects & Curriculum Mapping
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

                // Seed some mappings for the next 7 days
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

        // 9. Ensure Grades 1-12 and Syllabus are seeded for the "MOAT" Lesson Planner
        const teacher = await this.userRepo.findOne({ where: { school_id: savedSchool.id, email: 'teacher@greenfield.edu' } });
        if (teacher) {
            const gradeLevels = [1, 3, 5, 7, 8, 10, 12];
            const subjects = await this.subjectRepo.find({ where: { school_id: savedSchool.id } });

            for (const grade of gradeLevels) {
                // Ensure Class exists
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
                    // Create TeacherSubject mapping if missing
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

                    // Create Syllabus for each Class/Subject
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

        // 10. Seed Board Configurations
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
}
