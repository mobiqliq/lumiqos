import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LumiqosBaseEntity } from './base.entity';
import { School } from './school.entity';

@Entity('class')
export class Class extends LumiqosBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  class_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  class_name: string;

  @Column({ type: 'int', nullable: true })
  grade_level: number;

  @Column({ nullable: true })
  max_capacity: number;

  @Column({ nullable: true })
  room_number: string;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school: School;
}
