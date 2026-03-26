import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class GradeScale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'float', nullable: true })
    min_marks: number;

    @Column({ type: 'float', nullable: true })
    max_marks: number;

    @Column({ type: 'varchar', nullable: true })
    grade: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
