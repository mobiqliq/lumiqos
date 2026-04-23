import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { XceliQosBaseEntity } from './base.entity';
import { School } from './school.entity';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { Class } from './class.entity';
import { CurriculumUnit } from './curriculum-unit.entity';

@Entity('lesson_plans_v3')
export class LessonPlan extends XceliQosBaseEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  learning_outcome: string;

  @Column({ type: 'int', nullable: true })
  estimated_minutes: number;

  @Column({ type: 'int', nullable: true })
  complexity_index: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  plan_data: any;

  // Explicit Foreign Key Columns for TypeORM compatibility
  @Column({ type: 'uuid', nullable: true })
  class_id: string;

  @Column({ type: 'uuid', nullable: true })
  subject_id: string;

  @Column({ type: 'uuid', nullable: true })
  teacher_id: string;

  @Column({ type: 'uuid', nullable: true })
  unit_id: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => CurriculumUnit, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  unit: CurriculumUnit;
}
