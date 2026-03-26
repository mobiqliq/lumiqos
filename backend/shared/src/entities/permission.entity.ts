import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true, unique: true })
    permission_id: string;

    @Column({ type: 'varchar', nullable: true })
    module: string;

    @Column({ type: 'varchar', nullable: true })
    action: string;
}
