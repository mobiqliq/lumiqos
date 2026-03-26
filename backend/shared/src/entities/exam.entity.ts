import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Exam {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    exam_id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'uuid', nullable: true })
    academic_year_id: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ type: 'uuid', nullable: true })
    exam_type_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
