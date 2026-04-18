import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from './student.entity';
import { LumiqosBaseEntity } from './base.entity';

@Entity('student_learning_profile')
@Index(['student_id', 'profile_type'])
@Index(['school_id'])
export class StudentLearningProfile extends LumiqosBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  student_id: string;

  @Column({ type: 'varchar', length: 50 })
  profile_type: string;

  @Column({ type: 'jsonb' })
  profile_data: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
