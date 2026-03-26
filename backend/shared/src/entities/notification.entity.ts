import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    notification_id: string;

    @Column({ type: 'varchar', nullable: true })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', nullable: true })
    type: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    created_by: string; // Added created_by

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
