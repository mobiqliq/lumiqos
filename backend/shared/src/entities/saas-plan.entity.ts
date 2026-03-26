import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SaasPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    plan_id: string;

    @Column({ type: 'int', nullable: true })
    max_students: number;

    @Column({ type: 'int', nullable: true })
    max_teachers: number;

    @Column({ type: 'boolean', default: false })
    ai_features_enabled: boolean;

    @Column({ type: 'boolean', default: false })
    analytics_enabled: boolean;
}
