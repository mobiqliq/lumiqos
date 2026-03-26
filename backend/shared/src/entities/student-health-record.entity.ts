import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class StudentHealthRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
}
