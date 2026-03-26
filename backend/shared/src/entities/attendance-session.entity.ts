import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AttendanceSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    session_id: string;

    @Column({ type: 'uuid', nullable: true })
    school_id: string;

    @Column({ type: 'uuid', nullable: true })
    academic_year_id: string;

    @Column({ type: 'uuid', nullable: true })
    class_id: string;

    @Column({ type: 'uuid', nullable: true })
    section_id: string;

    @Column({ type: 'uuid', nullable: true })
    subject_id: string;

    @Column({ type: 'timestamp', nullable: true }) // Changed to timestamp/Date
    session_date: Date;
}
