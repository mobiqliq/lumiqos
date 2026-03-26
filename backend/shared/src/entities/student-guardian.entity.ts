import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StudentGuardian {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    user_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'boolean', default: false })
    is_primary: boolean;

    @Column({ type: 'varchar', nullable: true })
    relationship: string;
}
