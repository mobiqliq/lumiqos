import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ReportCardSubject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    report_card_id: string;

    @Column({ type: 'varchar', nullable: true })
    school_id: string;
}
