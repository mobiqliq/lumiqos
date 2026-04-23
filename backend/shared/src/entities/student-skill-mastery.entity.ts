import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Student } from './student.entity';
import { Skill } from './skill.entity';
import { XceliQosBaseEntity } from './base.entity';

@Entity('student_skill_mastery')
@Index(['student_id', 'skill_id'], { unique: true })
@Index(['school_id'])
@Index(['last_assessed_at'])
export class StudentSkillMastery extends XceliQosBaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  student_id: string;

  @Column({ type: 'uuid' })
  @Index()
  skill_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  mastery_level: number; // 0-100

  @Column({ type: 'int', nullable: true })
  attempts: number;

  @Column({ type: 'int', nullable: true })
  successes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number;

  @Column({ type: 'timestamp', nullable: true })
  last_assessed_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assessment_source: string; // 'quiz', 'assignment', 'teacher', 'ai'

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
