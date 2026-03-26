import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AnalyticsSnapshot {
    @PrimaryGeneratedColumn('uuid')
    id: string;
}
