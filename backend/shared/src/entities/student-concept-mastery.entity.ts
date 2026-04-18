import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from './student.entity';
import { Concept } from './concept.entity';
import { LumiqosBaseEntity } from './base.entity';

@Entity('student_concept_mastery')
@Index(['student_id', 'concept_id'], { unique: true })
@Index(['school_id'])
@Index(['last_assessed_at'])
export class StudentConceptMastery extends LumiqosBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  student_id: string;

  @Column({ type: 'uuid' })
  @Index()
  concept_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  mastery_level: number; // 0-100

  @Column({ type: 'int', nullable: true })
  exposure_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number;

  @Column({ type: 'timestamp', nullable: true })
  last_assessed_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  understanding_level: string; // 'novice', 'developing', 'proficient', 'advanced'

  @Column({ type: 'jsonb', nullable: true })
  misconceptions: string[];

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Concept, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'concept_id' })
  concept: Concept;
}
