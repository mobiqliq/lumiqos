import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['school_id', 'class_name'])
export class Class {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    name: string;

    @Column({ type: 'varchar' })
    class_name: string;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ type: 'uuid' })
    school_id: string;

    @Column({ type: 'int', nullable: true })
    grade_level: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
