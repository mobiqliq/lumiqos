import { Entity, Column } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum BoardReportType {
  FINANCIAL = "financial",
  ACADEMIC = "academic",
  COMPLIANCE = "compliance",
  OPERATIONAL = "operational",
  CUSTOM = "custom",
}

export enum BoardReportStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum BoardReportVisibility {
  BOARD_ONLY = "board_only",
  PRINCIPAL = "principal",
  ALL_ADMIN = "all_admin",
}

@Entity("board_reports")
export class BoardReport extends XceliQosBaseEntity {
  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "enum", enum: BoardReportType })
  report_type: BoardReportType;

  @Column({ type: "date" })
  period_start: Date;

  @Column({ type: "date" })
  period_end: Date;

  @Column({ type: "uuid", nullable: true })
  academic_year_id: string;

  @Column({ type: "uuid", nullable: true })
  generated_by: string;

  @Column({ type: "enum", enum: BoardReportStatus, default: BoardReportStatus.DRAFT })
  status: BoardReportStatus;

  @Column({ type: "jsonb", default: {} })
  data_snapshot: Record<string, any>;

  @Column({ type: "text", nullable: true })
  ai_narrative: string;

  @Column({ type: "enum", enum: BoardReportVisibility, default: BoardReportVisibility.BOARD_ONLY })
  visibility: BoardReportVisibility;

  @Column({ type: "uuid", nullable: true })
  approved_by: string;

  @Column({ type: "timestamptz", nullable: true })
  approved_at: Date;

  @Column({ type: "varchar", length: 500, nullable: true })
  export_ref: string;
}
