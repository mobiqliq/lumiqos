import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';

@Entity()
export class StudentAttendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    session_id: string;

    @Column({ type: 'varchar', nullable: true })
    student_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'varchar', nullable: true })
    status: string;

    @Column({ type: 'text', nullable: true })
    remarks: string; // Added remarks

    @ManyToOne(() => AttendanceSession)
    @JoinColumn({ name: 'session_id' })
    session: AttendanceSession;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
