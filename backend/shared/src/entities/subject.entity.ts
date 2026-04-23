import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';
import { School } from './school.entity';

@Entity('subject')
export class Subject extends XceliQosBaseEntity {
  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  subject_name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  board_id: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  credits: number;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school: School;
}
