import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity()
export class Subject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    subject_name: string;

    @Column({ type: 'varchar', nullable: true })
    subject_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;

    @Column({ type: 'uuid', nullable: true })
    board_id: string;

    @Column({
        type: 'varchar',
        default: 'CORE'
    })
    category: 'CORE' | 'VOCATIONAL';

    @ManyToOne(() => Board)
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
