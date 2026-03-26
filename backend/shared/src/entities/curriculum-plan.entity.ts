import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { Class } from './class.entity';
import { Subject } from './subject.entity';
import { CurriculumPlanItem } from './curriculum-plan-item.entity';

@Entity()
export class CurriculumPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    academic_year_id: string;

    @Column()
    class_id: string;

    @Column()
    subject_id: string;

    @Column({ type: 'int' })
    total_topics: number;

    @Column({ type: 'int' })
    total_estimated_hours: number;

    @Column({ type: 'date' })
    planned_start_date: string;

    @Column({ type: 'date' })
    planned_end_date: string;

    @Column({ type: 'varchar', default: 'draft' }) // draft, active, completed
    status: string;

    @ManyToOne(() => School)
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => AcademicYear)
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;

    @ManyToOne(() => Class)
    @JoinColumn({ name: 'class_id' })
    class: Class;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @OneToMany(() => CurriculumPlanItem, item => item.plan)
    items: CurriculumPlanItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
