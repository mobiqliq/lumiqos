import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class LumiqosBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  school_id: string; // FIX: Restored to match Architecture Memory

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at: Date;
}
