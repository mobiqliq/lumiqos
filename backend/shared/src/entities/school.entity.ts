import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class School {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    school_name: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_code: string;

    @Column({ type: 'varchar', nullable: true })
    country: string;

    @Column({ type: 'varchar', nullable: true })
    region: string; // Added region

    @Column({ type: 'varchar', nullable: true })
    timezone: string;

    @Column({ type: 'varchar', nullable: true })
    board: string; // e.g., CBSE, ICSE, IB, Cambridge
}
