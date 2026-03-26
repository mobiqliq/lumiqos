import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Syllabus } from './syllabus.entity';

@Entity()
export class SyllabusTopic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    syllabus_id: string;

    @Column()
    topic_name: string;

    @Column({ type: 'int' })
    sequence: number;

    @ManyToOne(() => Syllabus, (s) => s.topics)
    @JoinColumn({ name: 'syllabus_id' })
    syllabus: Syllabus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
