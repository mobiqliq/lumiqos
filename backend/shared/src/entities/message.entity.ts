import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    message_id: string;

    @Column({ type: 'varchar', nullable: true })
    thread_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    sender_id: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    message_text: string; // Alias for content often used

    @Column({ type: 'timestamp', nullable: true })
    sent_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
