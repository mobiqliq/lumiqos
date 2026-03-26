import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Class } from './class.entity';
import { Section } from './section.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';

@Entity()
export class TeacherSubject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    teacher_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @Column({ type: 'varchar', nullable: true })
    subject_id: string;

    @Column({ type: 'varchar', nullable: true })
    class_id: string;

    @Column({ type: 'varchar', nullable: true })
    section_id: string;

    @Column({ type: 'float', default: 1 })
    periods_per_day: number;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Section)
    @JoinColumn({ name: 'section_id' })
    section: Section;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
