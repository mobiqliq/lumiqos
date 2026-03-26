import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StudentDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string; // Added school_id
}
