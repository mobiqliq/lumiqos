import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { School } from './school.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { SyllabusTopic } from './syllabus-topic.entity';

@Entity()
export class Syllabus {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    class_id: string;

    @Column()
    subject_id: string;

    @Column({ type: 'int' })
    units: number;

    @Column({ type: 'int' })
    estimated_days: number;

    @Column({ type: 'int', default: 0 })
    total_topics: number;

    @Column({ type: 'varchar', nullable: true })
    current_topic: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @OneToMany(() => SyllabusTopic, (t) => t.syllabus)
    topics: SyllabusTopic[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
