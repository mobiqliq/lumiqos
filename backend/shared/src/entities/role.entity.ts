import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true, unique: true })
    role_id: string;

    @Column({ type: 'varchar', nullable: true })
    role_name: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
