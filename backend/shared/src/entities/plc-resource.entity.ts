import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum PLCResourceType {
  ARTICLE = "article",
  VIDEO = "video",
  RESEARCH = "research",
  TOOL = "tool",
  TEMPLATE = "template",
}

@Entity("plc_resources")
export class PLCResource extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  plc_group_id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "enum", enum: PLCResourceType })
  resource_type: PLCResourceType;

  @Column({ type: "varchar", length: 1000, nullable: true })
  url: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  file_ref: string;

  @Column({ type: "uuid", nullable: true })
  shared_by: string;

  @Column({ type: "jsonb", default: [] })
  tags: string[];
}
