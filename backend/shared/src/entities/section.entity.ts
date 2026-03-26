import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    section_name: string;

    @Column({ type: 'uuid', nullable: true })
    section_id: string;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
