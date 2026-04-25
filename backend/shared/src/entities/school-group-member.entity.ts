import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum SchoolGroupMemberType {
  STUDENT = "student",
  TEACHER = "teacher",
  STAFF = "staff",
}

export enum SchoolGroupMemberRole {
  MEMBER = "member",
  MODERATOR = "moderator",
  LEAD = "lead",
}

@Entity("school_group_member")
@Index(["school_id", "group_id"])
@Index(["school_id", "member_id", "member_type"])
export class SchoolGroupMember extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  group_id: string;

  @Column({ type: "uuid" })
  member_id: string;

  @Column({ type: "enum", enum: SchoolGroupMemberType })
  member_type: SchoolGroupMemberType;

  @Column({ type: "enum", enum: SchoolGroupMemberRole, default: SchoolGroupMemberRole.MEMBER })
  role: SchoolGroupMemberRole;

  // Class teacher assigns house — tracked here
  @Column({ type: "uuid", nullable: true })
  assigned_by: string;

  @Column({ type: "timestamp" })
  joined_at: Date;

  // Soft exit — null means still active
  @Column({ type: "timestamp", nullable: true })
  exited_at: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  exit_reason: string;
}
