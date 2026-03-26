import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['school_id', 'academic_year_id', 'date'])
export class PlanningDay {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    school_id: string;

    @Column()
    academic_year_id: string;

    @Column({ type: 'date' })
    date: string;

    @Column({
        type: 'enum',
        enum: ['WORKING', 'HOLIDAY', 'EXAM', 'REVISION']
    })
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
