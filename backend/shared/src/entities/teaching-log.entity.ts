import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';
import { User } from './user.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';

@Entity()
export class TeachingLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    teacher_id: string;

    @Column()
    class_id: string;

    @Column()
    subject_id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'json' })
    topics_covered: any; // List of topic IDs or names

    @Column({ type: 'int', default: 1 })
    actual_sessions: number;

    @Column({ type: 'text', nullable: true })
    remarks: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
