import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from './class.entity';
import { Section } from './section.entity';

@Entity()
export class StudentEnrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    admission_number: string;

    @Column({ type: 'varchar', nullable: true })
    enrollment_id: string;

    @Column({ type: 'uuid', nullable: true })
    student_id: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'uuid', nullable: true })
    academic_year_id: string;

    @Column({ type: 'varchar', nullable: true })
    class_id: string;

    @Column({ type: 'varchar', nullable: true })
    section_id: string;

    @Column({ type: 'varchar', nullable: true })
    roll_number: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
