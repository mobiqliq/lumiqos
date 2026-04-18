import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Role } from '@lumiqos/shared/src/entities/role.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Running Idempotent Database Seeder...');

    // 1. Seed School
    let school = await this.schoolRepo.findOne({ where: { name: 'Lumiqos Demo Academy' } });
    if (!school) {
      school = this.schoolRepo.create({
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Lumiqos Demo Academy',
        is_active: true,
      });
      await this.schoolRepo.save(school);
      this.logger.log('Seeded: School');
    }

    // 2. Seed Role
    let role = await this.roleRepo.findOne({ where: { name: 'TEACHER' } });
    if (!role) {
      role = this.roleRepo.create({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'TEACHER',
      });
      await this.roleRepo.save(role);
      this.logger.log('Seeded: Role (TEACHER)');
    }

    // 3. Seed User (Teacher)
    let user = await this.userRepo.findOne({ where: { email: 'teacher@lumiqos.edu' } });
    if (!user) {
      user = this.userRepo.create({
        id: '33333333-3333-3333-3333-333333333333',
        school_id: school.id,
        role_id: role.id,
        email: 'teacher@lumiqos.edu',
        first_name: 'Demo',
        last_name: 'Teacher',
        is_active: true,
      });
      await this.userRepo.save(user);
      this.logger.log('Seeded: User (Teacher)');
    }

    // 4. Seed Class
    let cls = await this.classRepo.findOne({ where: { class_name: 'Grade 10-A', school_id: school.id } });
    if (!cls) {
      cls = this.classRepo.create({
        id: '44444444-4444-4444-4444-444444444444',
        school_id: school.id,
        class_name: 'Grade 10-A',
      });
      await this.classRepo.save(cls);
      this.logger.log('Seeded: Class (Grade 10-A)');
    }

    // 5. Seed Subject
    let subject = await this.subjectRepo.findOne({ where: { name: 'Science', school_id: school.id } });
    if (!subject) {
      subject = this.subjectRepo.create({
        id: '55555555-5555-5555-5555-555555555555',
        school_id: school.id,
        name: 'Science',
        category: 'CORE',
      });
      await this.subjectRepo.save(subject);
      this.logger.log('Seeded: Subject (Science)');
    }

    this.logger.log('Seeding Complete. System is ready for development.');
  }
}
