import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentIdentity } from '@xceliqos/shared/src/entities/student-identity.entity';
import { StudentPassport } from '@xceliqos/shared/src/entities/student-passport.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentIdentityService {
    constructor(
        @InjectRepository(StudentIdentity)
        private readonly identityRepo: Repository<StudentIdentity>,
        @InjectRepository(StudentPassport)
        private readonly passportRepo: Repository<StudentPassport>,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) {}

    async getOrCreateIdentity(school_id: string, student_id: string): Promise<StudentIdentity> {
        const student = await this.studentRepo.findOne({ where: { id: student_id, school_id } });
        if (!student) throw new NotFoundException(`Student ${student_id} not found in school ${school_id}`);

        let identity = await this.identityRepo.findOne({ where: { student_id } });
        if (!identity) {
            const federated_id = student.xceliq_id || `XQ-${uuidv4().split('-')[0].toUpperCase()}`;

            // Update student xceliq_id if not set
            if (!student.xceliq_id) {
                student.xceliq_id = federated_id;
                await this.studentRepo.save(student);
            }

            identity = await this.identityRepo.save(this.identityRepo.create({
                school_id,
                student_id,
                federated_id,
                xceliq_id: federated_id,
                school_history: [{
                    school_id,
                    school_name: '',
                    from_date: new Date().toISOString().split('T')[0],
                    to_date: null,
                    is_current: true,
                }],
            }));
        }
        return identity;
    }

    async getPassport(school_id: string, student_id: string): Promise<StudentPassport> {
        const identity = await this.getOrCreateIdentity(school_id, student_id);

        let passport = await this.passportRepo.findOne({ where: { federated_id: identity.federated_id } });
        if (!passport) {
            passport = await this.passportRepo.save(this.passportRepo.create({
                school_id,
                student_id,
                federated_id: identity.federated_id,
            }));
        }
        return passport;
    }

    async initiateTransfer(
        from_school_id: string,
        student_id: string,
        to_school_id: string,
        initiated_by: string,
    ) {
        const identity = await this.identityRepo.findOne({ where: { student_id, school_id: from_school_id } });
        if (!identity) throw new NotFoundException(`Student identity not found`);
        if (!identity.transfer_consent) throw new BadRequestException(`Transfer consent not granted for student ${student_id}`);

        const passport = await this.passportRepo.findOne({ where: { federated_id: identity.federated_id } });
        if (!passport) throw new NotFoundException(`Passport not found for student ${student_id}`);

        const audit_ref = `TRF-${uuidv4().split('-')[0].toUpperCase()}`;
        const transfer_date = new Date().toISOString().split('T')[0];

        // Log transfer in passport
        passport.transfer_log = [
            ...passport.transfer_log,
            {
                from_school_id,
                to_school_id,
                transfer_date,
                initiated_by,
                consent_verified: true,
                audit_ref,
            },
        ];
        await this.passportRepo.save(passport);

        // Update school_history in identity
        identity.school_history = identity.school_history.map(h =>
            h.is_current ? { ...h, to_date: transfer_date, is_current: false } : h
        );
        identity.school_history.push({
            school_id: to_school_id,
            school_name: '',
            from_date: transfer_date,
            to_date: null,
            is_current: true,
        });
        identity.school_id = to_school_id;
        await this.identityRepo.save(identity);

        return { audit_ref, transfer_date, federated_id: identity.federated_id };
    }
}
