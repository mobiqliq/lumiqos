import { Entity, Column, Index } from "typeorm";
import { XceliQosBaseEntity } from "./base.entity";

export enum AdmissionDocumentType {
  BIRTH_CERTIFICATE = "birth_certificate",
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  VISA = "visa",
  PRIOR_SCHOOL_TRANSCRIPT = "prior_school_transcript",
  TRANSFER_CERTIFICATE = "transfer_certificate",
  IMMUNIZATION_RECORD = "immunization_record",
  LANGUAGE_ASSESSMENT = "language_assessment",
  MEDICAL_CERTIFICATE = "medical_certificate",
  GUARDIAN_ID = "guardian_id",
  PROOF_OF_ADDRESS = "proof_of_address",
  INCOME_PROOF = "income_proof",        // RTE/EWS quota
  DISABILITY_CERTIFICATE = "disability_certificate",  // SEND/IEP
  PHOTOGRAPH = "photograph",
  OTHER = "other",
}

export enum DocumentStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  VERIFIED = "verified",
  REJECTED = "rejected",
  WAIVED = "waived",
}

@Entity("admission_document")
@Index(["school_id", "application_id"])
@Index(["school_id", "application_id", "document_type"])
export class AdmissionDocument extends XceliQosBaseEntity {
  @Column({ type: "uuid" })
  application_id: string;

  @Column({ type: "enum", enum: AdmissionDocumentType })
  document_type: AdmissionDocumentType;

  @Column({ type: "boolean", default: false })
  is_mandatory: boolean;

  @Column({ type: "enum", enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  // Storage reference (S3 key, GCS path, etc.) — no file stored in DB
  @Column({ type: "varchar", nullable: true })
  storage_reference: string;

  @Column({ type: "varchar", nullable: true })
  original_filename: string;

  @Column({ type: "varchar", nullable: true })
  mime_type: string;

  @Column({ type: "timestamp", nullable: true })
  uploaded_at: Date;

  @Column({ type: "uuid", nullable: true })
  uploaded_by: string;

  @Column({ type: "timestamp", nullable: true })
  verified_at: Date;

  @Column({ type: "uuid", nullable: true })
  verified_by: string;

  @Column({ type: "text", nullable: true })
  rejection_reason: string;

  // Expiry for time-limited docs (visa, medical certificate)
  @Column({ type: "date", nullable: true })
  document_expiry_date: string;
}
