import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("plc_groups")
export class PLCGroup extends XceliQosBaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  focus_area: string;

  @Column({ type: "uuid", nullable: true })
  lead_teacher_id: string;

  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  @Column({ type: "jsonb", default: {} })
  meeting_cadence: Record<string, any>;

  @Column({ type: "boolean", default: true })
  is_active: boolean;
}
