import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('school')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  school_id: string; 

  @Column({ nullable: true })
  school_code: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  school_name: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  board: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zip_code: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  subscription_tier: string;
}
