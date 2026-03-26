import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    password_hash: string;

    @Column({ type: 'varchar', nullable: true })
    first_name: string;

    @Column({ type: 'varchar', nullable: true })
    last_name: string;

    @Column({ type: 'varchar', nullable: true })
    user_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    role_id: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' })
    role: Role;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
