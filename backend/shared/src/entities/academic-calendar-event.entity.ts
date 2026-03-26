import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';

@Entity()
export class AcademicCalendarEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    academic_year_id: string;

    @Column({ type: 'int' })
    month_index: number;

    @Column({ type: 'varchar' })
    month_name: string;

    @Column({ type: 'int', array: true, default: '{}' })
    working_days: number[];

    @Column({ type: 'jsonb', nullable: true })
    events: string[];

    @Column({ type: 'varchar', default: 'pending' }) // pending, submitted, approved
    status: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => AcademicYear)
    @JoinColumn({ name: 'academic_year_id' })
    academic_year: AcademicYear;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
