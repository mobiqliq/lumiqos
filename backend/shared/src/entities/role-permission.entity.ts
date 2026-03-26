import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    role_id: string;

    @Column({ type: 'varchar', nullable: true })
    permission_id: string;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'permission_id', referencedColumnName: 'permission_id' })
    permission: Permission;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'role_id' })
    role: Role;
}
