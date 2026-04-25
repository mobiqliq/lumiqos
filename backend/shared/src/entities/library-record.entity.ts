import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum LibraryItemStatus {
  AVAILABLE = "available",
  ISSUED = "issued",
  RESERVED = "reserved",
  LOST = "lost",
  DAMAGED = "damaged",
  WITHDRAWN = "withdrawn"
}

export enum LibraryClassification {
  DEWEY = "dewey",
  LOC = "loc",
  CUSTOM = "custom"
}

@Entity("library_record")
@Index(["school_id", "isbn"], { unique: false })
@Index(["school_id", "rfid_tag"], { unique: true, where: "rfid_tag IS NOT NULL" })
export class LibraryRecord extends XceliQosBaseEntity {
  // Catalog
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", nullable: true })
  author: string;

  @Column({ type: "varchar", nullable: true })
  isbn: string;

  @Column({ type: "varchar", nullable: true })
  rfid_tag: string;

  // Classification
  @Column({ type: "varchar", default: LibraryClassification.DEWEY })
  classification_system: string;

  @Column({ type: "varchar", nullable: true })
  classification_number: string;

  // Multi-language support
  @Column({ type: "varchar", default: "en" })
  language_code: string; // ISO 639-1

  // Publisher info
  @Column({ type: "varchar", nullable: true })
  publisher: string;

  @Column({ type: "int", nullable: true })
  publish_year: number;

  @Column({ type: "varchar", nullable: true })
  edition: string;

  // Inventory
  @Column({ type: "int", default: 1 })
  total_copies: number;

  @Column({ type: "int", default: 1 })
  available_copies: number;

  @Column({ type: "varchar", default: LibraryItemStatus.AVAILABLE })
  status: string;

  // Issuance tracking
  @Column({ type: "uuid", nullable: true })
  issued_to_student_id: string;

  @Column({ type: "uuid", nullable: true })
  issued_to_staff_id: string;

  @Column({ type: "timestamptz", nullable: true })
  issued_at: Date;

  @Column({ type: "timestamptz", nullable: true })
  due_at: Date;

  @Column({ type: "timestamptz", nullable: true })
  returned_at: Date;

  @Column({ type: "int", default: 0 })
  renewal_count: number;

  // Fine tracking
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  fine_amount: number;

  @Column({ type: "varchar", default: "USD" })
  fine_currency: string; // ISO 4217

  @Column({ type: "boolean", default: false })
  fine_paid: boolean;

  // Reading record — feeds XceliQScore literacy dimension
  @Column({ type: "boolean", default: false })
  reading_completed: boolean;

  @Column({ type: "int", nullable: true })
  reading_rating: number; // 1-5, student-submitted

  // Reservation
  @Column({ type: "uuid", nullable: true })
  reserved_by_student_id: string;

  @Column({ type: "timestamptz", nullable: true })
  reserved_at: Date;

  // Subject linkage for curriculum alignment
  @Column({ type: "uuid", nullable: true })
  subject_id: string;

  @Column({ type: "jsonb", default: [] })
  tags: string[];
}
