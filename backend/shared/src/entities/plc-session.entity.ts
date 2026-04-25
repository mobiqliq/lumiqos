import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

@Entity("plc_sessions")
export class PLCSession extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  plc_group_id: string;

  @Column({ type: "date" })
  date: Date;

  @Column({ type: "int", default: 60 })
  duration_minutes: number;

  @Column({ type: "jsonb", default: {} })
  agenda: Record<string, any>;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "jsonb", default: {} })
  attendance: Record<string, any>;

  @Column({ type: "jsonb", default: [] })
  action_items: Record<string, any>;

  @Column({ type: "uuid", nullable: true })
  facilitator_id: string;
}
